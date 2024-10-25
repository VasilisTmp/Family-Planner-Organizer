import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';
import SelectDropdown from 'react-native-select-dropdown';
import notifee from '@notifee/react-native';

import {
  AddB,
  Background,
  ConfirmModal,
  EventModal,
  EventModal2,
  EventO,
  GhostBackHandler,
  MyButton,
  OptionsBar,
  CalendarModal,
} from '../components';
import colors from '../config/colors';
import {useMyStore} from '../../store';
import {emptyEvent, weekDays} from '../config/fake data';
import {groupEventsType} from '../config/types';
import globalStyles from '../config/globalStyles';
import {_deleteEventGroup, _deletePastEventsGroup} from '../api/Groups';
import socket from '../utils/socket';
import {EventsNotifications} from '../utils';

export const SortEvents = (array: groupEventsType[]) => {
  if (array.length) {
    array.sort((a, b) => {
      if (a.timeFrom && b.timeFrom) {
        const timeA = moment(a.timeFrom, 'HH:mm');
        const timeB = moment(b.timeFrom, 'HH:mm');
        return timeA.isAfter(timeB) ? 1 : timeA.isBefore(timeB) ? -1 : 0;
      } else if (!a.timeFrom !== !b.timeFrom) {
        return a.timeFrom ? -1 : 1;
      } else {
        return 0;
      }
    });
  }
};

const SortSections = (sections: {key: string; data: groupEventsType[]}[]) => {
  sections.sort((a, b) => {
    return moment(a.key, 'DD-MM-YYYY').isAfter(
      moment(b.key, 'DD-MM-YYYY'),
      'day',
    )
      ? 1
      : -1;
  });
  sections.forEach(s => SortEvents(s.data));
};

export default function CalendarScreen({navigation}: any) {
  const {events, setEvents, groupId, toggleLoading, members, reset} =
    useMyStore();
  const [today, setToday] = useState(moment().subtract(1, 'days'));
  const [refreshDay, setRefreshDay] = useState(moment());
  const [search, setSearch] = useState('');
  const [eventModal, setEventModal] = useState(false);
  const [eventModal2, setEventModal2] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [options, setOptions] = useState(true);
  const [calendarModal, setCalendarModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [firstRender, setFirstRender] = useState(0);

  const membersDropdown = (() => {
    const ret = [
      ...members.sort((a, b) => a.nickname.localeCompare(b.nickname)),
    ];
    ret.unshift({
      userId: '',
      nickname: 'All',
      color: '',
      originalname: true,
      birthdate: '',
      lastRead: '',
    });
    return ret;
  })();
  const customDatesStyles = [
    {
      startDate: today,
      dateNameStyle: {color: colors.details},
      dateNumberStyle: {color: colors.details},
    },
  ];
  const event = useRef(emptyEvent);
  const listRef = useRef<SectionList>(null);
  const agendaRef = useRef<CalendarStrip>(null);
  const starting = useRef(today);
  const selectedDate = useRef(refreshDay);
  const textInputRef = useRef<TextInput>(null);
  const focused = useIsFocused();
  const minDate = useRef(today);
  const maxDate = useRef(today);
  const scrollList = useRef(true);

  EventsNotifications();

  useEffect(() => {
    firstRender && toggleLoading(false);
  }, [firstRender]);

  useEffect(() => {
    setSelectedMember('');
  }, [reset]);

  useEffect(() => {
    if (!today.isSame(refreshDay, 'day')) {
      minDate.current = refreshDay.clone().day(1);
      minDate.current.isAfter(refreshDay, 'day') &&
        minDate.current.subtract(1, 'weeks');
      maxDate.current = refreshDay.clone().add(1, 'years').endOf('month');
      starting.current = refreshDay.clone().day(1);
      !refreshDay.day() && starting.current.subtract(1, 'weeks');
      setToday(refreshDay);
    }
  }, [refreshDay]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshDay(moment());
      // setRefreshDay(prev => prev.clone().add(1, 'days'));
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  async function deleteEventGroup() {
    toggleLoading(true);
    await _deleteEventGroup(groupId, event.current._id);
    setEventModal(false);
    socket.emit('deleteevent', {event: event.current._id, groupId});
    toggleLoading(false);
  }

  useEffect(() => {
    if (events.length) {
      const past = [] as string[];
      events.forEach(e => {
        if (!e.repeat) {
          today.isAfter(moment(e.date), 'day') && past.push(e._id);
        } else {
          const limitIsDate = e.until.includes('-');
          if (limitIsDate) {
            today.isAfter(moment(e.until), 'day') && past.push(e._id);
            return;
          }
          const add = e.every;
          let counter = 0;
          const next = moment(e.date);
          e.everyType === 'w' && next.day(weekDays.indexOf(e.on));
          e.everyType === 'm' && next.date(Number(e.on));
          if (next.isBefore(moment(e.date), 'day')) {
            e.everyType === 'w' && next.add(1, 'weeks');
            e.everyType === 'm' && next.add(1, 'months');
          }
          while (true) {
            if (counter === Number(e.until)) break;
            e.everyType === 'd' && next.add(add, 'days');
            e.everyType === 'w' && next.add(add, 'weeks');
            e.everyType === 'm' && next.add(add, 'months');
            counter++;
          }
          if (today.isAfter(next, 'day')) past.push(e._id);
        }
      });
      if (past.length) {
        (async () => {
          await _deletePastEventsGroup(groupId, past);
          setEvents(events.filter(e => !past.includes(e._id)));
        })();
        past.forEach(p => {
          notifee.cancelNotification(p);
          notifee.cancelNotification(p.concat('24'));
          notifee.cancelNotification(p.concat('3'));
        });
      }
    }
  }, [today, reset]);

  const repeatSections = useMemo(() => {
    const ret = [] as {key: string; data: groupEventsType[]}[];
    const repeatEvents = [] as groupEventsType[];
    events.forEach(e => e.repeat && repeatEvents.push(e));
    repeatEvents.forEach(e => {
      const limitIsDate = e.until.includes('-');
      const add = e.every;
      let counter = 0;
      const next = moment(e.date);
      e.everyType === 'w' && next.day(weekDays.indexOf(e.on));
      e.everyType === 'm' && next.date(Number(e.on));
      if (next.isBefore(moment(e.date), 'day')) {
        e.everyType === 'w' && next.add(1, 'weeks');
        e.everyType === 'm' && next.add(1, 'months');
      }
      while (true) {
        if (limitIsDate) {
          if (next.isAfter(moment(e.until), 'day')) break;
        } else {
          if (counter === Number(e.until)) break;
        }
        if (next.isSameOrAfter(today, 'day')) {
          const date = next.format('DD-MM-YYYY');
          const section = ret.find(r => r.key === date);
          section ? section.data.push(e) : ret.push({key: date, data: [e]});
        }
        e.everyType === 'd' && next.add(add, 'days');
        e.everyType === 'w' && next.add(add, 'weeks');
        e.everyType === 'm' && next.add(add, 'months');
        counter++;
      }
    });
    SortSections(ret);
    return ret;
  }, [events]);

  const dateSections = useMemo(() => {
    const ret = [] as {key: string; data: groupEventsType[]}[];
    const dateEvents = [] as groupEventsType[];
    events.forEach(e => !e.repeat && dateEvents.push(e));
    dateEvents.forEach(e => {
      const date = moment(e.date).format('DD-MM-YYYY');
      const found = ret.find(r => r.key === date);
      found ? found.data.push(e) : ret.push({key: date, data: [e]});
    });
    SortSections(ret);
    return ret;
  }, [events]);

  const birthdaySections = useMemo(() => {
    const ret = [] as {key: string; data: groupEventsType[]}[];
    let bId = 1;
    members.forEach(m => {
      if (m.birthdate) {
        const date = moment(m.birthdate).year(today.year());
        if (date.isSameOrAfter(today, 'day')) {
          const sectionDate = date.format('DD-MM-YYYY');
          const newE = {...emptyEvent};
          newE._id = bId.toString() + 'birthday';
          bId++;
          newE.title = 'BIRTHDAY !';
          newE.date = date.format('YYYY-MM-DD');
          newE.forId = m.userId;
          newE.notifications = true;
          const section = ret.find(r => r.key === sectionDate);
          section
            ? section.data.push(newE)
            : ret.push({key: sectionDate, data: [newE]});
        }
      }
    });
    SortSections(ret);
    return ret;
  }, [members]);

  const allSections = useMemo(() => {
    const mergedMap = new Map<string, groupEventsType[]>();
    repeatSections.forEach(s => mergedMap.set(s.key, [...s.data]));
    dateSections.forEach(s => {
      if (!mergedMap.has(s.key)) {
        mergedMap.set(s.key, [...s.data]);
      } else {
        mergedMap.set(s.key, mergedMap.get(s.key)!.concat(s.data));
      }
    });
    birthdaySections.forEach(s => {
      if (!mergedMap.has(s.key)) {
        mergedMap.set(s.key, [...s.data]);
      } else {
        mergedMap.set(s.key, mergedMap.get(s.key)!.concat(s.data));
      }
    });
    const mergedSections = Array.from(mergedMap, ([key, data]) => ({
      key,
      data,
    }));
    //[...mergedMap].map(([key, data]) => ({ key, data }));
    return mergedSections;
  }, [repeatSections, dateSections, birthdaySections]);

  const allData = useMemo(() => {
    const filteredSections = allSections
      .map(s => ({
        key: s.key,
        data: (selectedMember
          ? s.data.filter(e => e.forId === selectedMember || !e.forId)
          : [...s.data]
        ).filter(e => e.title.toLowerCase().includes(search.toLowerCase())),
      }))
      .filter(s => s.data.length > 0);
    return filteredSections.length ? filteredSections : [{key: '', data: []}];
  }, [allSections, search, selectedMember]);

  const marked = useMemo(() => {
    if (allData[0].key) {
      const ret = [] as {date: string; dots: {color: string}[]}[];
      allData.forEach(d => {
        const date = moment(d.key, 'DD-MM-YYYY').format('YYYY-MM-DD');
        ret.push({
          date: date,
          dots: [],
        });
        const found = ret.find(r => r.date === date);
        d.data.forEach(e => {
          const c = e.forId
            ? members.find(m => m.userId === e.forId)?.color || colors.text
            : colors.text;
          found?.dots.push({color: c});
        });
      });
      return ret;
    } else {
      return [{date: '', dots: []}];
    }
  }, [allData]);

  const marked2 = useMemo(() => {
    if (allData[0].key) {
      const ret = {} as any;
      allData.forEach(d => {
        const date = moment(d.key, 'DD-MM-YYYY').format('YYYY-MM-DD');
        ret[date] = {dots: []};
        d.data.forEach(e => {
          const c = e.forId
            ? members.find(m => m.userId === e.forId)?.color || colors.text
            : colors.text;
          ret[date].dots.push({color: c, selectedColor: c});
        });
      });
      return ret;
    } else {
      return {};
    }
  }, [allData]);

  const AgendaScroll = (modal: boolean) => {
    return function (date: moment.Moment) {
      modal && agendaRef.current?.setSelectedDate(date);
      selectedDate.current = date;
      const index = allData.findIndex(d => d.key === date.format('DD-MM-YYYY'));
      scrollList.current &&
        index !== -1 &&
        listRef.current?.scrollToLocation({
          animated: true,
          sectionIndex: index,
          itemIndex: 1,
        });
      scrollList.current = true;
    };
  };

  const renderItem = useCallback(
    ({item, section}: {item: any; section: any}) => (
      <EventO
        key={`${item._id}${section.key}`}
        event={item}
        onLongPress={() => {
          scrollList.current = false;
          agendaRef.current?.setSelectedDate(moment(section.key, 'DD-MM-YYYY'));
          event.current = item;
          setEventModal(true);
        }}
      />
    ),
    [],
  );

  const renderHeader = useCallback(
    ({section}: any) => (
      <TouchableWithoutFeedback key={section.key}>
        <View
          style={{
            backgroundColor: colors.secondary,
            paddingHorizontal: 15,
            paddingVertical: section.key ? 10 : 0,
          }}>
          {section.key && (
            <Text style={[globalStyles.text, {fontSize: 16}]}>
              {`${section.key}\t ${
                weekDays[moment(section.key, 'DD-MM-YYYY').day()]
              }`}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    ),
    [],
  );

  const EventsList = useMemo(() => {
    return (
      <SectionList
        maxToRenderPerBatch={2652}
        updateCellsBatchingPeriod={0}
        initialNumToRender={2652}
        keyExtractor={item => item._id}
        ref={listRef}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        removeClippedSubviews={true}
        stickySectionHeadersEnabled
        sections={allData}
        renderItem={renderItem}
        renderSectionHeader={renderHeader}
        ListFooterComponent={
          <TouchableWithoutFeedback>
            <View style={{paddingBottom: 100}} />
          </TouchableWithoutFeedback>
        }
      />
    );
  }, [allData, firstRender]);

  /////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      {focused && !options && (
        <GhostBackHandler
          action={() => {
            setSearch('');
            setOptions(true);
          }}
        />
      )}
      {focused && options && <GhostBackHandler action={navigation.goBack} />}
      <CalendarModal
        marked={marked2}
        today={today}
        key={`${selectedDate.current}${today}`}
        agendaScroll={AgendaScroll(true)}
        selectedDate={selectedDate.current}
        visible={calendarModal}
        close={() => setCalendarModal(false)}
        minDate={new Date(minDate.current.format('YYYY-MM-DD'))}
        maxDate={new Date(maxDate.current.format('YYYY-MM-DD'))}
      />
      <ConfirmModal
        close={() => setConfirmModal(false)}
        visible={confirmModal}
        text={event.current.todo ? 'Delete this task ?' : 'Delete this event ?'}
        confirm={deleteEventGroup}
      />
      <EventModal
        openConfirmModal={() => setConfirmModal(true)}
        event={event.current}
        visible={eventModal}
        openModal2={() => setEventModal2(true)}
        close={() => setEventModal(false)}
      />
      <EventModal2
        selectedDate={selectedDate.current.format('YYYY-MM-DD')}
        event={event.current}
        visible={eventModal2}
        close={() => setEventModal2(false)}
      />
      <OptionsBar>
        {!options ? (
          <>
            <MyButton
              source={require('../assets/backArrowIcon.png')}
              containerStyle={{left: 5}}
              onPress={() => {
                setSearch('');
                setOptions(true);
              }}
            />
            <View style={styles.searchCon}>
              <TextInput
                autoCorrect={false}
                ref={textInputRef}
                onChangeText={text => setSearch(text.trim())}
                placeholder="Search"
                placeholderTextColor={colors.tertiary}
                style={styles.searchInput}
              />
              <MyButton
                source={require('../assets/xIcon3.png')}
                dimensions={13}
                containerStyle={{right: 5, padding: 8.5}}
                onPress={() => {
                  textInputRef.current?.clear();
                  setSearch('');
                }}
              />
            </View>
          </>
        ) : (
          <>
            <MyButton
              source={require('../assets/searchIcon.png')}
              containerStyle={{left: 5}}
              onPress={() => setOptions(false)}
            />
            <SelectDropdown
              data={membersDropdown}
              defaultValue={membersDropdown.find(
                m => m.userId === selectedMember,
              )}
              buttonTextAfterSelection={() =>
                membersDropdown.find(m => m.userId === selectedMember)
                  ?.nickname || ''
              }
              onSelect={(selectedItem, index) =>
                setSelectedMember(selectedItem.userId)
              }
              onChangeSearchInputText={() => {}}
              rowTextForSelection={(item, index) => item.nickname}
              buttonStyle={styles.dropdownB}
              buttonTextStyle={styles.dropdownBtext}
              rowTextStyle={styles.dropdownOptionText}
              selectedRowStyle={{backgroundColor: colors.ripple}}
              dropdownStyle={{borderRadius: 20}}
              dropdownIconPosition={'right'}
              renderDropdownIcon={isOpened => {
                return (
                  <FontAwesome
                    name={isOpened ? 'chevron-up' : 'chevron-down'}
                    color={colors.text}
                    size={16}
                    style={{right: -2}}
                  />
                );
              }}
            />
            <MyButton
              containerStyle={{right: 50}}
              source={require('../assets/resetIcon.png')}
              iconStyle={{bottom: 1}}
              onPress={() => {
                selectedDate.current = today;
                agendaRef.current?.setSelectedDate(today);
                listRef.current?.scrollToLocation({
                  animated: true,
                  sectionIndex: 0,
                  itemIndex: 1,
                });
              }}
            />
            <MyButton
              containerStyle={{right: 5, padding: 11}}
              source={require('../assets/gridIcon.png')}
              dimensions={20}
              iconStyle={{top: 0, right: 0}}
              onPress={() => setCalendarModal(true)}
            />
          </>
        )}
      </OptionsBar>
      <CalendarStrip
        onWeekChanged={() => !firstRender && setFirstRender(1)}
        minDate={minDate.current}
        maxDate={maxDate.current}
        daySelectionAnimation={{
          type: 'border',
          borderWidth: 0.5,
          borderHighlightColor: colors.text,
          duration: 0,
        }}
        ref={agendaRef}
        onDateSelected={date => !calendarModal && AgendaScroll(false)(date)}
        markedDates={marked}
        startingDate={starting.current}
        highlightDateNameStyle={{color: colors.text}}
        highlightDateNumberStyle={{color: colors.text}}
        datesBlacklist={date => date.isBefore(today, 'day')}
        customDatesStyles={customDatesStyles}
        useNativeDriver
        scrollable
        scrollerPaging
        style={styles.strip}
        calendarColor={colors.background}
        calendarHeaderStyle={styles.calendarStrip}
        dateNumberStyle={{color: colors.text}}
        dateNameStyle={{color: colors.text, fontSize: 10}}
        iconStyle={{tintColor: colors.text}}
        disabledDateNameStyle={{color: colors.ripple2, fontSize: 10}}
        disabledDateNumberStyle={{color: colors.ripple2}}
        iconLeftStyle={{marginLeft: 2}}
        iconRightStyle={{marginRight: 2}}
      />
      {EventsList}
      <AddB
        containerStyle={{padding: 15, bottom: 30}}
        dimensions={32}
        onPress={() => {
          event.current = emptyEvent;
          setEventModal2(true);
        }}
      />
    </Background>
  );
}
const styles = StyleSheet.create({
  searchCon: {justifyContent: 'center', width: '57%', alignSelf: 'center'},
  searchInput: {
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.background,
    height: 48,
    fontSize: 18,
    color: colors.text,
    paddingLeft: 15,
    paddingRight: 35,
    borderRadius: 25,
  },
  calendarStrip: {color: colors.text, fontSize: 18, fontWeight: '500'},
  dropdownBtext: {left: 3, fontSize: 18, color: colors.text, textAlign: 'left'},
  dropdownOptionText: {fontSize: 18, textAlign: 'left', paddingHorizontal: 7},
  dropdownB: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.background,
    alignSelf: 'center',
    width: '46%',
    borderRadius: 25,
  },
  strip: {height: 80, marginTop: 7, marginBottom: 3},
});

import {
  Text,
  View,
  StyleSheet,
  BackHandler,
  TouchableWithoutFeedback,
  SectionList,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';

import {
  AddB,
  Background,
  ConfirmModal,
  EventO,
  EventModal,
  EventModal2,
  MyButton,
  OptionsBar,
  ItemO,
  GhostBackHandler,
  BottomOptionsBar,
  ItemModal2,
  ItemModal,
} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {useMyStore} from '../../store';
import {emptyEvent, weekDays} from '../config/fake data';
import {
  _deletePurchasedItemsGroup,
  _deleteItemsGroup,
  _getItemsGroup,
  _updatePurchasedItemsGroup,
  _deleteEventGroup,
} from '../api/Groups';
import {groupEventsType, groupItemsType} from '../config/types';
import {HomeScreenProps} from '../navigation/HomeStack';
import {SortEvents} from './CalendarScreen';
import socket from '../utils/socket';

let itemsSelected = [] as string[];
export let scrollViewRef: any;
const sections = [
  {title: 'Today', data: [] as any[]},
  {title: 'Tomorrow', data: [] as any[]},
  {title: 'Shopping list', data: [] as any[]},
];

export default function HomeScreen({navigation}: HomeScreenProps) {
  const [today2, setToday2] = useState(moment().subtract(1, 'days'));
  const [refreshDay, setRefreshDay] = useState(moment());
  const focused = useIsFocused();
  scrollViewRef = useRef<SectionList>(null);
  const today = today2.format('DD-MM-YYYY');
  const tomorrow2 = today2.clone().add(1, 'day');
  const tomorrow = tomorrow2.format('DD-MM-YYYY');
  const todayName = weekDays[today2.day()];
  const tomorrowName = weekDays[tomorrow2.day()];
  const pushItemsSelected = (id: string) => itemsSelected.push(id);
  const pullItemsSelected = (id: string) =>
    (itemsSelected = itemsSelected.filter(itemm => itemm !== id));
  const [ittem, setIttem] = useState({} as groupItemsType);
  const [event, setEvent] = useState({} as groupEventsType);
  const [selectedDate, setSelectedDate] = useState(today2);

  useEffect(() => {
    !today2.isSame(refreshDay, 'day') && setToday2(refreshDay);
  }, [refreshDay]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshDay(moment());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const {groupId, items, groupName, events, toggleLoading, members} =
    useMyStore();
  const [confirmModal, setConfirmModal] = useState(false);
  const [itemModal2, setItemModal2] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [eventModal2, setEventModal2] = useState(false);
  const [itemOptions, setItemOptions] = useState(false);
  const [purchase, setPurchase] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [localReset, setLocalReset] = useState(false);

  useEffect(() => {
    !itemOptions && !purchase && setCheckAll(false);
  }, [itemOptions, purchase]);

  useEffect(() => {
    const todayS = sections[0];
    const tomorrowS = sections[1];
    const t0 = today2.format('YYYY-MM-DD');
    const t1 = tomorrow2.format('YYYY-MM-DD');
    todayS.data = [];
    tomorrowS.data = [];
    let bId = 1;
    members.forEach(m => {
      if (m.birthdate) {
        const date = moment(m.birthdate).year(today2.year());
        const newE = {...emptyEvent};
        newE._id = bId.toString();
        bId++;
        newE.title = 'BIRTHDAY !';
        newE.date = date.format('YYYY-MM-DD');
        newE.forId = m.userId;
        newE.notifications = true;
        (t0 === newE.date && todayS.data.push(newE)) ||
          (t1 === newE.date && tomorrowS.data.push(newE));
      }
    });
    if (events.length) {
      events.forEach(e => {
        if (e.repeat) {
          const limitIsDate = e.until.includes('-');
          const add = e.every;
          let counter = 1;
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
              if (counter > Number(e.until)) break;
            }
            if (next.isAfter(tomorrow2, 'day')) break;
            next.isSame(today2, 'day') && todayS.data.push(e);
            next.isSame(tomorrow2, 'day') && tomorrowS.data.push(e);
            e.everyType === 'd' && next.add(add, 'days');
            e.everyType === 'w' && next.add(add, 'weeks');
            e.everyType === 'm' && next.add(add, 'months');
            counter++;
          }
        } else {
          (t0 === e.date && todayS.data.push(e)) ||
            (t1 === e.date && tomorrowS.data.push(e));
        }
      });
      SortEvents(todayS.data);
      SortEvents(tomorrowS.data);
    }
    setLocalReset(prev => !prev);
  }, [events, today2, members]);

  useEffect(() => {
    const itemsSection = sections[2];
    itemsSection.data = items.sort((a, b) => a.name.localeCompare(b.name));
    setLocalReset(prev => !prev);
  }, [items]);

  async function updatePurchasedItems(value: boolean) {
    if (itemsSelected.length) {
      await _updatePurchasedItemsGroup(groupId, itemsSelected, value);
      socket.emit('purchaseditems', {selected: itemsSelected, value, groupId});
      setPurchase(false);
    }
  }

  async function deletePurchasedItemsGroup() {
    await _deletePurchasedItemsGroup(groupId);
    socket.emit('deletepurchaseditems', {groupId});
  }

  async function deleteItemsGroup() {
    await _deleteItemsGroup(groupId, itemsSelected);
    socket.emit('deleteitems', {selected: itemsSelected, groupId});
    setItemOptions(false);
    setPurchase(true);
  }

  async function deleteEventGroup() {
    toggleLoading(true);
    await _deleteEventGroup(groupId, event._id);
    setEventModal(false);
    socket.emit('deleteevent', {event: event._id, groupId});
    toggleLoading(false);
  }
  /////////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      {focused && (itemOptions || purchase) && (
        <GhostBackHandler
          key={`${itemOptions}${purchase}`}
          action={() => {
            if (itemOptions) {
              setPurchase(true);
              setItemOptions(false);
            } else {
              setPurchase(false);
            }
          }}
        />
      )}
      {focused && !itemOptions && !purchase && (
        <GhostBackHandler action={BackHandler.exitApp} />
      )}
      <ItemModal
        image={ittem.image}
        close={() => setItemModal(false)}
        visible={itemModal}
      />
      <ItemModal2
        closeOptions={() => setItemOptions(false)}
        openPurchase={() => setPurchase(true)}
        item={ittem}
        close={() => setItemModal2(false)}
        visible={itemModal2}
      />
      <ConfirmModal
        close={() => setConfirmModal(false)}
        text={
          eventModal && event.todo
            ? 'Delete this task ?'
            : eventModal && !event.todo
            ? 'Delete this event ?'
            : itemOptions
            ? 'Remove selected items ?'
            : 'Remove purchased items ?'
        }
        visible={confirmModal}
        confirm={
          eventModal
            ? deleteEventGroup
            : !itemOptions
            ? deletePurchasedItemsGroup
            : deleteItemsGroup
        }
      />
      <EventModal
        openConfirmModal={() => setConfirmModal(true)}
        event={event}
        visible={eventModal}
        openModal2={() => setEventModal2(true)}
        close={() => setEventModal(false)}
      />
      <EventModal2
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        event={event}
        visible={eventModal2}
        close={() => setEventModal2(false)}
      />
      <OptionsBar>
        <MyButton
          containerStyle={styles.settingsB}
          source={require('../assets/settingsIcon.png')}
          onPress={() => {
            navigation.navigate('SettingsScreen');
            setItemOptions(false);
            setPurchase(false);
          }}
        />
        <Text numberOfLines={1} style={[globalStyles.text, styles.groupName]}>
          {groupName}
        </Text>
        <MyButton
          source={require('../assets/notesIcon.png')}
          containerStyle={styles.notesB}
          iconStyle={styles.notesBicon}
          onPress={() => {
            navigation.navigate('NotesScreen');
            setItemOptions(false);
            setPurchase(false);
          }}
        />
        <MyButton
          source={require('../assets/cartIcon.png')}
          containerStyle={styles.cartB2}
          iconStyle={styles.cartBicon2}
          onPress={
            () =>
              scrollViewRef.current.scrollToLocation({
                animated: true,
                sectionIndex: 2,
                itemIndex: 1,
              })
            // console.log(itemsSelected)
          }
        />
      </OptionsBar>
      <SectionList
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        stickySectionHeadersEnabled
        sections={sections}
        renderItem={({item, section}) =>
          Object.keys(item).includes('date') ? (
            <EventO
              event={item}
              onLongPress={() => {
                const date = section.title === 'Today' ? today : tomorrow;
                setSelectedDate(moment(date, 'DD-MM-YYYY'));
                setEvent(item);
                setEventModal(true);
              }}
            />
          ) : (
            <ItemO
              checkAll={checkAll}
              purchase={purchase}
              options={itemOptions}
              item={item}
              onPress={() => {
                if (item.image) {
                  setIttem(item);
                  setItemModal(true);
                }
              }}
              onLongPress={() => setPurchase(true)}
              edit={() => {
                setIttem(item);
                setItemModal2(true);
              }}
              pushItem={() => pushItemsSelected(item._id)}
              pullItem={() => pullItemsSelected(item._id)}
            />
          )
        }
        renderSectionHeader={({section}) => {
          if (section.title === 'Today') {
            return (
              <TouchableWithoutFeedback>
                <View style={[styles.calendarTitleContainer]}>
                  <Text style={[globalStyles.text, styles.title]}>Today</Text>
                  <Text style={[globalStyles.text, styles.titleDate]}>
                    {today}
                  </Text>
                  <Text style={[globalStyles.text, styles.titleDay]}>
                    {todayName}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            );
          } else if (section.title === 'Tomorrow') {
            return (
              <TouchableWithoutFeedback>
                <View style={[styles.calendarTitleContainer, {marginTop: 3}]}>
                  <Text style={[globalStyles.text, styles.title]}>
                    Tomorrow
                  </Text>
                  <Text style={[globalStyles.text, styles.titleDate]}>
                    {tomorrow}
                  </Text>
                  <Text style={[globalStyles.text, styles.titleDay]}>
                    {tomorrowName}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            );
          } else {
            return (
              <TouchableWithoutFeedback>
                <View style={styles.shopTitleContainer}>
                  <Text style={[globalStyles.text, styles.title]}>
                    Shopping list
                  </Text>
                  {!purchase && !itemOptions && (
                    <MyButton
                      color={colors.secondary}
                      containerStyle={{right: 5}}
                      source={require('../assets/trashIcon.png')}
                      onPress={() => setConfirmModal(true)}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            );
          }
        }}
        ListFooterComponent={
          <TouchableWithoutFeedback>
            <View style={{paddingBottom: 95}} />
          </TouchableWithoutFeedback>
        }
      />
      {itemOptions || purchase ? (
        <BottomOptionsBar>
          {purchase && (
            <>
              <MyButton
                color="transparent"
                containerStyle={{position: 'relative'}}
                source={require('../assets/checkIcon3.png')}
                iconStyle={{top: 2}}
                onPress={() =>
                  itemsSelected.length && updatePurchasedItems(true)
                }
              />
              <MyButton
                dimensions={19}
                color="transparent"
                containerStyle={{position: 'relative', padding: 11}}
                source={require('../assets/xIcon.png')}
                onPress={() =>
                  itemsSelected.length && updatePurchasedItems(false)
                }
              />
              <MyButton
                dimensions={20}
                containerStyle={{position: 'relative', padding: 11}}
                onPress={() => {
                  setItemOptions(true);
                  setPurchase(false);
                }}
                color="transparent"
                source={require('../assets/editIcon.png')}
              />
            </>
          )}
          {itemOptions && (
            <MyButton
              color="transparent"
              containerStyle={{position: 'relative'}}
              source={require('../assets/trashIcon.png')}
              onPress={() =>
                itemOptions && itemsSelected.length && setConfirmModal(true)
              }
            />
          )}
          <MyButton
            color="transparent"
            source={require('../assets/checkAllIcon.png')}
            dimensions={24}
            containerStyle={styles.checkAllB}
            onPress={() => setCheckAll(prev => !prev)}
          />
        </BottomOptionsBar>
      ) : (
        <AddB
          containerStyle={{bottom: 30}}
          source={require('../assets/addCartIcon.png')}
          onPress={() => {
            scrollViewRef.current.scrollToLocation({
              animated: true,
              sectionIndex: 2,
              itemIndex: 1,
            });
            setIttem({} as groupItemsType);
            setItemModal2(true);
          }}
        />
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  groupName: {fontSize: 18, marginLeft: 55, width: 235},
  title: {fontSize: 20, fontWeight: 'bold', flex: 1},
  titleDate: {flex: 1, fontSize: 18, textAlign: 'center'},
  titleDay: {fontSize: 18, flex: 1, textAlign: 'right'},
  calendarTitleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shopTitleContainer: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 3,
    justifyContent: 'center',
  },
  cartB2: {right: 50}, //+45?
  cartBicon2: {right: 1},
  settingsB: {left: 5},
  notesB: {right: 5},
  notesBicon: {left: 3},
  checkAllB: {position: 'relative'},
});

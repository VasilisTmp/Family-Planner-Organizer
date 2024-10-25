import moment from 'moment';
import {useEffect, useState} from 'react';
import {
  Text,
  View,
  Modal,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useToast} from 'react-native-toast-notifications';

import {groupEventsType} from '../config/types';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {Background} from './Background';
import MyInput from './MyInput';
import RippleB from './RippleB';
import {useMyStore} from '../../store';
import {
  _addEventGroup,
  _getMembersGroup,
  _updateEventGroup,
} from '../api/Groups';
import {weekDays} from '../config/fake data';
import socket from '../utils/socket';

interface Props {
  event: groupEventsType;
  visible: boolean;
  close: Function;
  selectedDate?: string;
}

export default function EventModal2({
  event,
  visible,
  close,
  selectedDate = '',
}: Props) {
  const {members, events, groupId, toggleLoading} = useMyStore();
  const userID = useMyStore(state => state.userId);
  const [untilSwitch, setUntilSwitch] = useState(true);
  const [disabled, setDisabled] = useState(true);
  const [disabled2, setDisabled2] = useState(false);
  const [datePicker, setDatePicker] = useState(false);
  const [untilDatePicker, setUntilDatePicker] = useState(false);
  const [timeFrom2, setTimeFrom2] = useState(new Date());
  const [timeTo2, setTimeTo2] = useState(new Date());
  const [timeFromPicker, setTimeFromPicker] = useState(false);
  const [timeToPicker, setTimeToPicker] = useState(false);
  const [date2, setDate2] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [untilNumber, setUntilNumber] = useState('1');
  const [eventState, setEventState] = useState({
    _id: event._id,
    userId: event.userId,
    title: event.title,
    date: event.date,
    repeat: event.repeat,
    every: event.every,
    everyType: event.everyType,
    on: event.on,
    until: event.until,
    timeFrom: event.timeFrom,
    timeTo: event.timeTo,
    todo: event.todo,
    forId: event.forId,
    done: event.done,
    notifications: event.notifications,
  });
  const [everyString, setEveryString] = useState('');

  const membersDropdown = (() => {
    const ret = [
      ...members.sort((a, b) => a.nickname.localeCompare(b.nickname)),
    ];
    ret.unshift({
      userId: '',
      nickname: ' -',
      color: '',
      originalname: true,
      birthdate: '',
      lastRead: '',
    });
    return ret;
  })();
  const toast = useToast();
  const days = [...weekDays];
  const monthDays = Array.from({length: 31}, (_, i) => i + 1);
  const lastDay = days[0];
  days.splice(0, 1);
  days.splice(6, 0, lastDay);
  const handleChange = (key: string, value: any) =>
    setEventState(prev => ({...prev, [key]: value}));

  useEffect(() => {
    eventState.title &&
    ((eventState.todo && (eventState.timeFrom || !eventState.timeTo)) ||
      eventState.timeFrom ||
      (!eventState.timeTo && !eventState.notifications))
      ? setDisabled(false)
      : setDisabled(true);
    eventState.todo ? setDisabled2(true) : setDisabled2(false);
    // console.log(JSON.stringify(eventState, null, 8));
  }, [eventState]);

  useEffect(() => {
    if (visible) {
      setEventState(event);
      if (!event._id) {
        handleChange('date', selectedDate);
        handleChange('on', weekDays[moment(selectedDate).day()]);
        handleChange(
          'until',
          moment(selectedDate).add(1, 'days').format('YYYY-MM-DD'),
        );
        setEveryString('1');
        setUntilSwitch(true);
      } else {
        if (!event.repeat) {
          handleChange('every', 1);
          setEveryString('1');
          handleChange('everyType', 'w');
          handleChange('on', weekDays[moment(event.date).day()]);
          handleChange(
            'until',
            moment(event.date).add(1, 'days').format('YYYY-MM-DD'),
          );
          setUntilSwitch(true);
        } else {
          setEveryString(event.every.toString());
          event.until.includes('-')
            ? setUntilSwitch(true)
            : setUntilSwitch(false);
        }
      }
    }
  }, [visible]);

  useEffect(() => {
    eventState.date && setDate2(new Date(eventState.date));
  }, [eventState.date]);

  useEffect(() => {
    if (eventState.until) {
      eventState.until.includes('-')
        ? setUntilDate(new Date(eventState.until))
        : setUntilNumber(eventState.until);
    }
  }, [eventState.until]);

  useEffect(() => {
    const t2 = new Date();
    if (eventState.timeFrom) {
      const t = moment(eventState.timeFrom, 'HH:mm');
      t2.setHours(t.hour(), t.minute());
    } else {
      t2.setHours(0, 0);
    }
    setTimeFrom2(t2);
  }, [eventState.timeFrom]);

  useEffect(() => {
    const t2 = new Date();
    if (eventState.timeTo) {
      const t = moment(eventState.timeTo, 'HH:mm');
      t2.setHours(t.hour(), t.minute());
    } else {
      t2.setHours(0, 0);
    }
    setTimeTo2(t2);
  }, [eventState.timeTo]);

  async function addEventGroup() {
    if (!eventState.repeat) {
      eventState.every = 0;
      eventState.everyType = '';
      eventState.on = '';
      eventState.until = '';
    }
    const {_id, userId, done, ...newE} = eventState;
    if (
      events.some(e => {
        const {_id, userId, done, ...ev} = e;
        return JSON.stringify(ev) === JSON.stringify(newE);
      })
    ) {
      toast.hideAll();
      toast.show('This event already exists.', {type: 'warning'});
    } else {
      toggleLoading(true);
      eventState.userId = userID;
      const {_id, done, ...newE} = eventState;
      const newnew = await _addEventGroup(groupId, newE);
      socket.emit('newevent', {event: newnew, groupId});
      toggleLoading(false);
    }
    close();
  }

  async function updateEventGroup() {
    if (!eventState.repeat) {
      eventState.every = 0;
      eventState.everyType = '';
      eventState.on = '';
      eventState.until = '';
    }
    let toUpdate = true;
    const newE: any = {...eventState};
    ['_id', 'userId', 'done'].forEach(e => delete newE[e]);
    const currE: any = {...event};
    ['_id', 'userId', 'done'].forEach(e => delete currE[e]);
    if (JSON.stringify(currE) === JSON.stringify(newE)) toUpdate = false;
    if (!toUpdate) {
      close();
      return;
    }
    if (
      events.some(e => {
        const {_id, userId, done, ...ev} = e;
        return JSON.stringify(ev) === JSON.stringify(newE);
      })
    ) {
      toast.hideAll();
      toast.show('This event already exists.', {type: 'warning'});
    } else {
      toggleLoading(true);
      if (!eventState.todo) eventState.done = false;
      await _updateEventGroup(groupId, eventState);
      socket.emit('updateevent', {event: eventState, groupId});
      toggleLoading(false);
    }
    close();
  }
  ////////////////////////////////////////////////////////////////////////////////
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={() => close()}>
      <Background style={{paddingTop: 15, paddingHorizontal: 15}}>
        <ScrollView overScrollMode="never" showsVerticalScrollIndicator={false}>
          <TouchableWithoutFeedback>
            <View>
              <Text
                style={[globalStyles.text, {fontSize: 17.5, marginBottom: 10}]}>
                Event
              </Text>
              <TextInput
                autoCorrect={false}
                defaultValue={eventState.title}
                onChangeText={text => handleChange('title', text.trim())}
                style={[globalStyles.text, styles.titleInput]}
              />
              <DatePicker
                modal
                locale="en-GB"
                open={datePicker}
                date={date2}
                androidVariant="nativeAndroid"
                onConfirm={datee => {
                  handleChange('date', moment(datee).format('YYYY-MM-DD'));
                  setDatePicker(false);
                }}
                onCancel={() => setDatePicker(false)}
                mode="date"
              />
              <DatePicker
                minimumDate={moment().add(1, 'days').toDate()}
                modal
                locale="en-GB"
                open={untilDatePicker}
                date={untilDate}
                androidVariant="nativeAndroid"
                onConfirm={datee => {
                  handleChange('until', moment(datee).format('YYYY-MM-DD'));
                  setUntilDatePicker(false);
                }}
                onCancel={() => setUntilDatePicker(false)}
                mode="date"
              />
              <View style={styles.dateCon}>
                {eventState.repeat && (
                  <Text
                    style={[
                      globalStyles.text,
                      {fontSize: 17.5, marginRight: 15},
                    ]}>
                    From
                  </Text>
                )}
                <MyInput
                  text={moment(eventState.date).format('DD-MM-YYYY')}
                  onPress={() => setDatePicker(true)}
                />
                <View
                  style={[
                    styles.switchCon1,
                    {marginLeft: eventState.repeat ? 40 : 97.5},
                  ]}>
                  <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                    repeat
                  </Text>
                  <Switch
                    style={{marginTop: 10}}
                    trackColor={{false: '#767577', true: colors.details}}
                    onValueChange={value => handleChange('repeat', value)}
                    thumbColor={colors.text}
                    value={eventState.repeat}
                  />
                </View>
              </View>
              {eventState.repeat && (
                <>
                  <View style={styles.dateCon2_1}>
                    <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                      Every
                    </Text>
                    <TextInput
                      defaultValue={everyString}
                      value={everyString}
                      inputMode="numeric"
                      style={styles.everyInput}
                      onChangeText={text => {
                        let t = text.replace(/\D/g, '');
                        if (t === '0') t = '1';
                        handleChange('every', Number(t));
                        setEveryString(t);
                      }}
                    />
                    <SelectDropdown
                      disableAutoScroll
                      onChangeSearchInputText={() => {}}
                      defaultValue={(() => {
                        const many = eventState.every > 1;
                        switch (eventState.everyType) {
                          case 'd':
                            return many ? 'Days' : 'Day';
                          case 'w':
                            return many ? 'Weeks' : 'Week';
                          case 'm':
                            return many ? 'Months' : 'Month';
                          default:
                            return '';
                        }
                      })()}
                      buttonStyle={[styles.dropDownB, {left: 15}]}
                      buttonTextStyle={styles.dropdownBtext}
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
                      dropdownIconPosition={'right'}
                      dropdownStyle={{borderRadius: 20}}
                      rowTextStyle={styles.dropdownOptionText}
                      selectedRowStyle={{backgroundColor: colors.ripple}}
                      buttonTextAfterSelection={() => {
                        const many = eventState.every > 1;
                        switch (eventState.everyType) {
                          case 'd':
                            return many ? 'Days' : 'Day';
                          case 'w':
                            return many ? 'Weeks' : 'Week';
                          case 'm':
                            return many ? 'Months' : 'Month';
                          default:
                            return '';
                        }
                      }}
                      data={
                        eventState.every > 1
                          ? ['Days', 'Weeks', 'Months']
                          : ['Day', 'Week', 'Month']
                      }
                      onSelect={(selectedItem, index) => {
                        const type = selectedItem.charAt(0).toLowerCase();
                        handleChange('everyType', type);
                        const temp = moment(eventState.date);
                        switch (type) {
                          case 'w':
                            handleChange('on', weekDays[temp.day()]);
                            break;
                          case 'm':
                            handleChange('on', temp.date().toString());
                            break;
                          default:
                            handleChange('on', '');
                            break;
                        }
                      }}
                      rowTextForSelection={(item, index) => item}
                    />
                  </View>
                  {(eventState.everyType === 'w' ||
                    eventState.everyType === 'm') && (
                    <View style={styles.dateCon2_2}>
                      <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                        On
                      </Text>
                      <SelectDropdown
                        disableAutoScroll
                        onChangeSearchInputText={() => {}}
                        defaultValue={eventState.on}
                        buttonStyle={[styles.dropDownB, {left: 15}]}
                        buttonTextStyle={styles.dropdownBtext}
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
                        dropdownIconPosition={'right'}
                        dropdownStyle={{height: 350, borderRadius: 20}}
                        rowTextStyle={styles.dropdownOptionText}
                        selectedRowStyle={{backgroundColor: colors.ripple}}
                        buttonTextAfterSelection={() => eventState.on}
                        data={eventState.everyType === 'w' ? days : monthDays}
                        onSelect={(selectedItem, index) =>
                          handleChange('on', selectedItem.toString())
                        }
                        rowTextForSelection={(item, index) => item}
                      />
                    </View>
                  )}
                  <View style={styles.dateCon2_3}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                        Until
                      </Text>
                      {untilSwitch ? (
                        <MyInput
                          containerStyle={{marginLeft: 15}}
                          text={
                            eventState.until.includes('-')
                              ? moment(eventState.until).format('DD-MM-YYYY')
                              : eventState.until
                          }
                          onPress={() => setUntilDatePicker(true)}
                        />
                      ) : (
                        <TextInput
                          defaultValue={untilNumber}
                          value={untilNumber}
                          inputMode="numeric"
                          style={[styles.everyInput, {height: 48.5}]}
                          onChangeText={text => {
                            let t = text.replace(/\D/g, '');
                            if (t === '0') t = '1';
                            handleChange('until', t);
                            setUntilNumber(t);
                          }}
                        />
                      )}
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                        {untilSwitch
                          ? 'date'
                          : Number(untilNumber) > 1
                          ? 'occurrences'
                          : 'occurrence'}
                      </Text>
                      <Switch
                        style={{marginLeft: 15}}
                        trackColor={{false: '#767577', true: colors.details}}
                        onValueChange={value => {
                          setUntilSwitch(value);
                          if (value) {
                            const temp = moment(eventState.date);
                            handleChange(
                              'until',
                              temp.add(1, 'days').format('YYYY-MM-DD'),
                            );
                            setUntilNumber('1');
                          } else {
                            handleChange('until', '1');
                          }
                        }}
                        thumbColor={colors.text}
                        value={untilSwitch}
                      />
                    </View>
                  </View>
                </>
              )}
              <DatePicker
                locale="en-GB"
                is24hourSource="locale"
                mode="time"
                modal
                open={timeFromPicker}
                date={timeFrom2}
                androidVariant="nativeAndroid"
                onConfirm={datee => {
                  setTimeFromPicker(false);
                  handleChange('timeFrom', moment(datee).format('HH:mm'));
                }}
                onCancel={() => setTimeFromPicker(false)}
              />
              <DatePicker
                locale="en-GB"
                is24hourSource="locale"
                mode="time"
                modal
                open={timeToPicker}
                date={timeTo2}
                androidVariant="nativeAndroid"
                onConfirm={datee => {
                  handleChange('timeTo', moment(datee).format('HH:mm'));
                  setTimeToPicker(false);
                }}
                onCancel={() => setTimeToPicker(false)}
              />
              <View style={styles.timeCon}>
                <Text style={[globalStyles.text, {fontSize: 17.5}]}>From</Text>
                <View style={{marginLeft: '1%'}}>
                  <MyInput
                    containerStyle={{marginBottom: 10}}
                    onPress={() => setTimeFromPicker(true)}
                    text={eventState.timeFrom || '\t\t:'}
                  />
                  <RippleB
                    text="Clear"
                    style2={{width: 120}}
                    onPress={() => handleChange('timeFrom', '')}
                  />
                </View>
                <Text
                  style={[
                    globalStyles.text,
                    {fontSize: 17.5, marginLeft: '1%'},
                  ]}>
                  To
                </Text>
                <View style={{marginLeft: '1%'}}>
                  <MyInput
                    containerStyle={{marginBottom: 10}}
                    onPress={() => setTimeToPicker(true)}
                    text={eventState.timeTo || '\t\t:'}
                  />
                  <RippleB
                    text="Clear"
                    style2={{width: 120}}
                    onPress={() => handleChange('timeTo', '')}
                  />
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                  Member
                </Text>
                <SelectDropdown
                  data={membersDropdown}
                  disableAutoScroll
                  onChangeSearchInputText={() => {}}
                  defaultValue={membersDropdown.find(
                    m => m.userId === eventState.forId,
                  )}
                  buttonStyle={styles.dropdownB3}
                  buttonTextStyle={styles.dropdownBtext}
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
                  dropdownIconPosition={'right'}
                  dropdownStyle={{maxHeight: 250, borderRadius: 20}}
                  rowTextStyle={styles.dropdownOptionText}
                  selectedRowStyle={{backgroundColor: colors.ripple}}
                  buttonTextAfterSelection={() =>
                    membersDropdown.find(m => m.userId === eventState.forId)
                      ?.nickname || ''
                  }
                  onSelect={(selectedItem, index) =>
                    handleChange('forId', selectedItem.userId)
                  }
                  rowTextForSelection={(item, index) => item.nickname}
                />
              </View>
              <View
                style={{
                  marginTop: 50,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 88,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={[globalStyles.text, {fontSize: 17.5}]}>
                    Todo
                  </Text>
                  <Switch
                    style={{marginLeft: 15}}
                    trackColor={{false: '#767577', true: colors.details}}
                    onValueChange={value => {
                      handleChange('todo', value);
                      handleChange('notifications', value);
                    }}
                    thumbColor={colors.text}
                    value={eventState.todo}
                  />
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={[
                      globalStyles.text,
                      {fontSize: 17.5, fontStyle: 'italic', fontWeight: '200'},
                    ]}>
                    Notifications
                  </Text>
                  <Switch
                    disabled={disabled2}
                    style={{marginLeft: 15}}
                    trackColor={{false: '#767577', true: colors.details}}
                    onValueChange={value =>
                      handleChange('notifications', value)
                    }
                    thumbColor={colors.text}
                    value={eventState.notifications}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.finalBsCon,
                  {marginBottom: eventState.repeat ? 109 : 0},
                ]}>
                <RippleB
                  disabled={disabled}
                  color={colors.details}
                  rippleColor={colors.ripple2}
                  textStyle={styles.finalBtext}
                  text={event._id ? 'Update' : 'Add'}
                  style2={[styles.finalBcon2, {opacity: disabled ? 0.5 : 1}]}
                  onPress={event._id ? updateEventGroup : addEventGroup}
                />
                <RippleB
                  color={colors.tertiary}
                  rippleColor={colors.ripple2}
                  textStyle={styles.finalBtext}
                  text="Cancel"
                  style2={styles.finalBcon2}
                  onPress={close}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </Background>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.text,
    marginBottom: 50,
  },
  everyInput: {
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: colors.text,
    marginLeft: 15,
    width: 55,
  },
  finalBcon2: {width: 150, paddingVertical: 15},
  finalBtext: {fontWeight: '500'},
  dropdownBtext: {left: 3, fontSize: 18, color: colors.text, textAlign: 'left'},
  finalBsCon: {flexDirection: 'row', justifyContent: 'space-evenly'},
  dateCon: {flexDirection: 'row', alignItems: 'center'},
  dateCon2_1: {flexDirection: 'row', alignItems: 'center', marginTop: 20},
  dateCon2_2: {flexDirection: 'row', alignItems: 'center', marginTop: 25},
  dateCon2_3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    justifyContent: 'space-between',
  },
  switchCon1: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 5,
  },
  timeCon: {
    marginTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
    justifyContent: 'space-between',
  },
  dropdownOptionText: {fontSize: 18, textAlign: 'left', paddingHorizontal: 7},
  dropdownB3: {
    left: 15,
    borderWidth: 1,
    borderColor: colors.text,
    width: 172.8,
    backgroundColor: colors.background,
    borderRadius: 25,
  },
  dropDownB: {
    borderWidth: 1,
    borderColor: colors.text,
    width: 143.8,
    backgroundColor: colors.background,
    borderRadius: 25,
  },
});

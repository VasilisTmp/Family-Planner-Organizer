import {Modal} from 'react-native';
import {Calendar} from 'react-native-calendario';
import {MarkedDays} from 'react-native-month';
import moment from 'moment';
import {useState} from 'react';

import {Background} from './Background';
import MyButton from './MyButton';
import OptionsBar from './OptionsBar';
import colors from '../config/colors';

interface Props {
  visible: boolean;
  close: Function;
  selectedDate: moment.Moment;
  minDate: Date;
  maxDate: Date;
  agendaScroll: Function;
  marked: MarkedDays;
  today: moment.Moment;
}
export default function CalendarModal({
  visible,
  close,
  selectedDate,
  minDate,
  maxDate,
  agendaScroll,
  marked,
  today,
}: Props) {
  const [active, setActive] = useState(
    new Date(selectedDate.format('YYYY-MM-DD')),
  );

  const minMoment = moment(minDate);
  const days = Math.ceil(moment.duration(today.diff(minMoment)).asDays());
  const disabledDays = (() => {
    const ret = {} as any;
    for (let i = 0; i < days; i++) {
      ret[minMoment.format('YYYY-MM-DD')] = true;
      minMoment.add(1, 'days');
    }
    return ret;
  })();
  ///////////////////////////////////////////////////////////////////////////////
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={() => close()}>
      <Background>
        <OptionsBar>
          <MyButton
            source={require('../assets/backArrowIcon.png')}
            containerStyle={{left: 5}}
            onPress={close}
          />
          <MyButton
            containerStyle={{right: 5, padding: 10.2}}
            source={require('../assets/listIcon.png')}
            dimensions={21.5}
            iconStyle={{top: 2.8, right: 0.2}}
            onPress={close}
          />
        </OptionsBar>
        <Calendar
          markedDays={marked}
          disabledDays={disabledDays}
          firstDayMonday
          numberOfMonths={13}
          startDate={active}
          minDate={minDate}
          maxDate={maxDate}
          monthHeight={390}
          onPress={date => {
            setActive(date);
            agendaScroll(moment(date));
            close();
          }}
          theme={{
            dayContainerStyle: {backgroundColor: colors.background},
            dayTextStyle: {color: colors.text},
            nonTouchableDayTextStyle: {color: colors.tertiary},
            monthTitleTextStyle: {
              color: colors.text,
              fontWeight: '500',
              fontSize: 18,
            },
            weekColumnTextStyle: {color: colors.text},
            todayTextStyle: {
              color: colors.details,
            },
            activeDayContainerStyle: {
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderColor: colors.text,
            },
          }}
        />
      </Background>
    </Modal>
  );
}

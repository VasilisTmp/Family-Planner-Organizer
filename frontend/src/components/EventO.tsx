import {Image, StyleSheet, Text, View} from 'react-native';

import {useMyStore} from '../../store';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupEventsType} from '../config/types';
import {Option} from './Option';

interface Props {
  event: groupEventsType;
  onLongPress?: Function;
  onPress?: Function;
}

export default function EventO({
  event,
  onLongPress = () => null,
  onPress = () => null,
}: Props) {
  const {userId, members} = useMyStore();

  let color = 'white';
  let forName = '';
  if (event.forId) {
    const member = members.find(m => m.userId === event.forId);
    if (member) {
      color = member.color;
      forName = member.nickname;
    }
  }
  const icon = (() => {
    if (event.repeat) {
      if (event.everyType === 'w') {
        return require('../assets/repeatWIcon.png');
      } else if (event.everyType === 'm') {
        return require('../assets/repeatMIcon.png');
      } else {
        return require('../assets/repeatDIcon.png');
      }
    } else {
      return '';
    }
  })();
  ////////////////////////////////////////////////////////////////////////////////////
  return (
    <Option
      containerStyle={styles.eventContainer}
      containerStyle2={styles.eventContainer2}
      onLongPress={() =>
        (userId === event.userId ||
          (event.todo && (userId === event.forId || !event.forId))) &&
        onLongPress()
      }
      onPress={onPress}>
      <View style={styles.eventTextContainer}>
        {event.forId && (
          <Text style={[globalStyles.text, {fontSize: 14, color: color}]}>
            {forName}
          </Text>
        )}
        <Text style={[globalStyles.text, {fontSize: 18}]}>{event.title}</Text>
      </View>
      <Text
        style={[
          globalStyles.text,
          styles.eventTextContainer2,
          {textAlign: event.timeTo ? 'right' : 'left'},
        ]}>
        {event.timeFrom || ''}
        {event.timeTo && ` - ${event.timeTo}`}
      </Text>
      <View style={styles.iconCon}>
        {event.todo && (
          <>
            {event.done ? (
              <Image
                style={styles.eventIcon}
                source={require('../assets/checkIcon2.png')}
              />
            ) : (
              <Image
                style={styles.eventIcon2}
                source={require('../assets/uncheckedIcon.png')}
              />
            )}
          </>
        )}
      </View>
      {event.repeat && (
        <Image
          source={icon}
          style={{
            position: 'absolute',
            top: 0,
            left: 5,
            height: 15,
            width: 15,
          }}
        />
      )}
      {event.notifications && (
        <Image
          source={require('../assets/bellIcon.png')}
          style={{
            position: 'absolute',
            top: 2,
            left: event.repeat ? 27 : 5,
            height: 12,
            width: 12,
          }}
        />
      )}
    </Option>
  );
}

const styles = StyleSheet.create({
  eventContainer: {borderRadius: 9, marginVertical: 3},
  eventContainer2: {borderRadius: 9, borderRightWidth: 4, borderBottomWidth: 5},
  eventIcon: {width: 25, height: 25},
  eventIcon2: {width: 25, height: 25, tintColor: colors.ripple2},
  eventTextContainer: {flex: 1, marginRight: 30},
  eventTextContainer2: {fontSize: 16, textAlign: 'right', width: 94, right: 8},
  iconCon: {width: 25, left: 8},
});

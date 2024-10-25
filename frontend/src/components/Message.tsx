import {useState} from 'react';
import moment from 'moment';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupMessagesType} from '../config/types';
import {useMyStore} from '../../store';

interface Props {
  message: groupMessagesType;
  prevDiff: boolean;
  nextDiff: boolean;
  nextMe: boolean;
}

export default function Meesage({message, prevDiff, nextDiff, nextMe}: Props) {
  const [info, setInfo] = useState(false);
  const {userId, members} = useMyStore();

  const color =
    members.find(m => m.userId === message.userId)?.color || 'white';
  const nickname =
    members.find(m => m.userId === message.userId)?.nickname || 'User';
  const isMe = message.userId === userId;
  let readFrom: string[] = [];
  members.forEach(
    m =>
      m.userId !== userId &&
      m.lastRead === message._id &&
      readFrom.push(m.userId),
  );
  const readList = readFrom.map((r, i) => {
    const c = members.find(m => m.userId === r)?.color;
    return <View key={i} style={[styles.readDot, {backgroundColor: c}]} />;
  });
  const c = isMe ? colors.details : colors.tertiary;
  const marginBottom = nextDiff ? (isMe ? 0 : nextMe ? 13 : 8) : 3; //0 h 10?
  const ddate = moment(message.date);

  ///////////////////////////////////////////////////////////////////////////
  return (
    <View
      style={{
        alignItems: isMe ? 'flex-end' : 'flex-start',
        marginBottom: marginBottom,
      }}>
      {info && (
        <Text style={[styles.dateText, {marginBottom: prevDiff ? -3 : 2}]}>
          {ddate.isSame(moment(), 'day')
            ? ddate.format('HH:mm')
            : ddate.format('ddd HH:mm DD-MM-yyyy')}
        </Text>
      )}
      {prevDiff && (
        <Text numberOfLines={1} style={styles.whose}>
          {nickname}
        </Text>
      )}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {!isMe && nextDiff && (
          <View style={[styles.senderDot, {backgroundColor: color}]} />
        )}
        <View
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            marginLeft: !isMe && nextDiff ? 5 : 23,
          }}>
          <Pressable
            unstable_pressDelay={70}
            onPress={() => setInfo(prev => !prev)}
            style={({pressed}) => [
              {
                minWidth: 40,
                backgroundColor: pressed ? colors.ripple2 : c,
                borderRadius: 20,
                marginRight: isMe ? 13 : 70,
                marginLeft: isMe ? 60 : 0,
              },
            ]}>
            <Text style={[globalStyles.text, styles.text]}>{message.text}</Text>
          </Pressable>
        </View>
      </View>
      {!!readFrom.length && (
        <View
          style={[
            styles.readList,
            {marginBottom: nextDiff ? 0 : 4, marginTop: isMe ? 5 : 0},
          ]}>
          {readList}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  readList: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 13,
  },
  readDot: {borderRadius: 100, width: 7, height: 7, marginLeft: 2.5},
  senderDot: {borderRadius: 100, width: 5, height: 5, marginLeft: 13},
  whose: {
    fontSize: 13,
    marginLeft: 33,
    color: colors.ripple,
    fontWeight: '300',
    marginBottom: 2,
    maxWidth: '50%',
  },
  dateText: {
    fontSize: 13,
    color: colors.ripple,
    fontWeight: '300',
    alignSelf: 'center',
  },
  text: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 17,
    textAlign: 'left',
  },
});

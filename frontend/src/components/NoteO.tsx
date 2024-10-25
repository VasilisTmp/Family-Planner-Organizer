import {useEffect, useState} from 'react';
import {Text, StyleSheet} from 'react-native';

import {useMyStore} from '../../store';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupNotesType} from '../config/types';
import {Option} from './Option';

interface Props {
  note: groupNotesType;
  options: boolean;
  onPress?: Function;
  onLongPress?: Function;
  pushNote: Function;
  pullNote: Function;
  checkAll: boolean;
}

export default function NoteO({
  note,
  options,
  onPress = () => null,
  onLongPress = () => null,
  pushNote,
  pullNote,
  checkAll,
}: Props) {
  const [checked, setChecked] = useState(false);
  const {userId, members} = useMyStore();

  const userColor = members.find(member => member.userId === note.userId)
    ?.color;
  const borderColor = !options
    ? userColor
    : note.userId === userId
    ? userColor
    : colors.tertiary;

  useEffect(() => {
    !options && setChecked(false);
  }, [options]);

  useEffect(() => {
    checked ? pushNote() : pullNote();
  }, [checked]);

  useEffect(() => {
    checkAll && userId === note.userId ? setChecked(true) : setChecked(false);
  }, [checkAll]);
  ////////////////////////////////////////////////////////////////////////////
  return (
    <Option
      color={checked ? userColor : colors.background}
      onLongPress={() => {
        if (!options) {
          userId === note.userId && setChecked(true);
          onLongPress();
        }
      }}
      onPress={() => {
        options
          ? userId === note.userId && setChecked(prev => !prev)
          : onPress();
      }}
      containerStyle={[styles.noteCon]}
      containerStyle2={[styles.noteCon2, {borderColor: borderColor}]}>
      {note.title && (
        <Text
          style={[
            globalStyles.text,
            {fontSize: 18, fontWeight: '500', marginBottom: 10},
          ]}
          numberOfLines={1}>
          {note.title}
        </Text>
      )}
      {note.text && (
        <Text style={[globalStyles.text, {fontSize: 17}]} numberOfLines={5}>
          {note.text}
        </Text>
      )}
    </Option>
  );
}

const styles = StyleSheet.create({
  noteCon: {borderRadius: 15, marginBottom: 15},
  noteCon2: {
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

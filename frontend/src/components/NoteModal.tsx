import {useEffect, useRef, useState} from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useToast} from 'react-native-toast-notifications';

import {useMyStore} from '../../store';
import {_addNoteGroup, _updateNoteGroup} from '../api/Groups';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {groupNotesType} from '../config/types';
import {Background} from './Background';
import MyButton from './MyButton';
import OptionsBar from './OptionsBar';
import socket from '../utils/socket';

interface Props {
  note: groupNotesType;
  visible: boolean;
  close: Function;
  openConfirmModal: Function;
  deleteNote: Function;
}

export default function NoteModal({
  note,
  visible,
  close,
  openConfirmModal,
  deleteNote,
}: Props) {
  const [pinned, setPinned] = useState(false);
  const {notes, userId, groupId} = useMyStore();
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const textInputRef = useRef<TextInput>(null);
  const toast = useToast();

  useEffect(() => {
    if (visible) {
      setTitle(note.title);
      setText(note.text);
      note.pinned ? setPinned(note.pinned) : setPinned(false);
    }
  }, [visible]);

  async function addNoteGroup() {
    if (
      notes.some(
        n => n.userId === userId && n.title === title && n.text === text,
      )
    ) {
      toast.hideAll();
      toast.show('This note already exists.', {type: 'warning'});
    } else {
      const newNote = await _addNoteGroup(
        groupId,
        userId,
        title || '',
        text || '',
        pinned,
      );
      socket.emit('newnote', {note: newNote, groupId});
    }
  }

  async function updateNoteGroup() {
    if (
      (note.title !== title || note.text !== text) &&
      notes.some(
        n => n.userId === userId && n.title === title && n.text === text,
      )
    ) {
      toast.hideAll();
      toast.show('This note already exists.', {type: 'warning'});
    } else if (
      note.title !== title ||
      note.text !== text ||
      note.pinned !== pinned
    ) {
      await _updateNoteGroup(
        groupId,
        note._id,
        title || '',
        text || '',
        pinned,
      );
      note.text = text;
      note.title = title;
      note.pinned = pinned;
      socket.emit('updatenote', {note: note, groupId});
    }
  }
  ////////////////////////////////////////////////////////////////////////////////
  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        if (note._id) {
          if (note.userId === userId) {
            text || title ? updateNoteGroup() : deleteNote();
          }
        } else if (text || title) {
          addNoteGroup();
        }
        close();
      }}>
      <Background>
        <OptionsBar>
          <MyButton
            color="transparent"
            source={require('../assets/backArrowIcon.png')}
            containerStyle={styles.backB}
            onPress={() => {
              if (note._id) {
                if (note.userId === userId) {
                  text || title ? updateNoteGroup() : deleteNote();
                }
              } else if (text || title) {
                addNoteGroup();
              }
              close();
            }}
          />
          {userId === note.userId && (
            <>
              <MyButton
                source={require('../assets/pinIcon.png')}
                containerStyle={styles.pinB}
                iconStyle={{tintColor: pinned ? colors.details : colors.text}}
                onPress={() => setPinned(prev => !prev)}
              />
              <MyButton
                source={require('../assets/trashIcon.png')}
                containerStyle={styles.deleteB}
                onPress={openConfirmModal}
              />
            </>
          )}
        </OptionsBar>
        <TextInput
          editable={!note._id || userId === note.userId ? true : false}
          autoCorrect={false}
          defaultValue={title}
          onChangeText={value => setTitle(value.replace(/\s+$/, ''))}
          style={[globalStyles.text, styles.title]}
          placeholder="Title"
          placeholderTextColor={colors.tertiary}
          multiline
        />
        <TextInput
          editable={!note._id || userId === note.userId ? true : false}
          ref={textInputRef}
          placeholder="Note"
          placeholderTextColor={colors.tertiary}
          style={[globalStyles.text, styles.text]}
          autoCorrect={false}
          defaultValue={text}
          onChangeText={value => setText(value.replace(/\s+$/, ''))}
          multiline
        />
        <TouchableWithoutFeedback onPress={() => textInputRef.current?.focus()}>
          <View style={{flex: 1}} />
        </TouchableWithoutFeedback>
      </Background>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backB: {left: 5},
  deleteB: {right: 5},
  pinB: {right: 50},
  title: {fontSize: 20, fontWeight: 'bold', padding: 11},
  text: {fontSize: 18, padding: 11},
});

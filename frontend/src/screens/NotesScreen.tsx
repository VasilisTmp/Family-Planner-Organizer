import {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useMyStore} from '../../store';
import {_deleteNotesGroup, _updatePinnedNotesGroup} from '../api/Groups';
import {
  AddB,
  Background,
  BottomOptionsBar,
  ConfirmModal,
  GhostBackHandler,
  MyButton,
  NoteModal,
  NoteO,
  OptionsBar,
} from '../components';
import globalStyles from '../config/globalStyles';
import {groupNotesType} from '../config/types';
import {NotesScreenProps} from '../navigation/HomeStack';
import socket from '../utils/socket';

let notesSelected = [] as string[];

export default function NotesScreen({navigation}: NotesScreenProps) {
  const {notes, groupId} = useMyStore();
  const [noteOptions, setNoteOptions] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [lists, setLists] = useState([] as groupNotesType[][]);
  const [note, setNote] = useState({} as groupNotesType);

  const pushNotesSelected = (id: string) => notesSelected.push(id);
  const pullNotesSelected = (id: string) =>
    (notesSelected = notesSelected.filter(itemm => itemm !== id));
  const putNotesSelected = (id: string[]) => (notesSelected = id);

  useEffect(() => {
    !noteOptions && setCheckAll(false);
  }, [noteOptions]);

  useEffect(() => {
    const pinnedNotes = [] as groupNotesType[];
    const otherNotes = [] as groupNotesType[];
    notes.forEach(n => (n.pinned ? pinnedNotes.push(n) : otherNotes.push(n)));
    pinnedNotes.length ? setPinned(true) : setPinned(false);
    const lsts = [] as groupNotesType[][];
    for (let i = 0; i < 4; i++) lsts.push([]);
    pinnedNotes.forEach((n, i) => (i % 2 ? lsts[1].push(n) : lsts[0].push(n)));
    otherNotes.forEach((n, i) => (i % 2 ? lsts[3].push(n) : lsts[2].push(n)));
    setLists(lsts);
  }, [notes]);

  const NotesLists = lists.map(l => (
    <View style={styles.list}>
      {l.map(n => (
        <NoteO
          key={n._id}
          note={n}
          checkAll={checkAll}
          options={noteOptions}
          pullNote={() => pullNotesSelected(n._id)}
          pushNote={() => pushNotesSelected(n._id)}
          onPress={() => {
            putNotesSelected([n._id]);
            setNote(n);
            setNoteModal(true);
          }}
          onLongPress={() => setNoteOptions(true)}
        />
      ))}
    </View>
  ));

  async function updatePinnedNotesGroup() {
    if (notesSelected.length) {
      const toUpdate = notes.filter(n => notesSelected.includes(n._id));
      const pinned = toUpdate.some(n => n.pinned);
      const notPinned = toUpdate.some(n => !n.pinned);
      const value = (pinned && notPinned) || notPinned ? true : false;
      socket.emit('pinnednotes', {selected: notesSelected, value, groupId});
      await _updatePinnedNotesGroup(groupId, notesSelected, value);
      setNoteOptions(false);
    }
  }

  async function deleteNotesGroup() {
    await _deleteNotesGroup(groupId, notesSelected);
    socket.emit('deletenotes', {selected: notesSelected, groupId});
    setNoteOptions(false);
    setNoteModal(false);
  }

  /////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      {noteOptions && <GhostBackHandler action={() => setNoteOptions(false)} />}
      <ConfirmModal
        close={() => setConfirmModal(false)}
        text={noteOptions ? 'Delete selected notes ?' : 'Delete note ?'}
        visible={confirmModal}
        confirm={deleteNotesGroup}
      />
      <NoteModal
        deleteNote={deleteNotesGroup}
        openConfirmModal={() => setConfirmModal(true)}
        close={() => setNoteModal(false)}
        note={note}
        visible={noteModal}
      />
      <OptionsBar>
        <MyButton
          containerStyle={{left: 5}}
          onPress={
            () => (noteOptions ? setNoteOptions(false) : navigation.goBack())
            // () => console.log(notesSelected)
          }
          source={require('../assets/backArrowIcon.png')}
        />
      </OptionsBar>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled>
        <TouchableWithoutFeedback>
          <View style={styles.scrollView}>
            {pinned && (
              <>
                <Text style={[globalStyles.text, styles.pinnedTitle]}>
                  Pinned
                </Text>
                <View style={styles.listsCon}>
                  {NotesLists[0]}
                  {NotesLists[1]}
                </View>
                <Text style={[globalStyles.text, styles.othersTittle]}>
                  Others
                </Text>
              </>
            )}
            <View style={styles.listsCon}>
              {NotesLists[2]}
              {NotesLists[3]}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      {noteOptions ? (
        <BottomOptionsBar>
          <MyButton
            color="transparent"
            source={require('../assets/pinIcon.png')}
            containerStyle={{position: 'relative'}}
            onPress={updatePinnedNotesGroup}
          />
          <MyButton
            color="transparent"
            containerStyle={{position: 'relative'}}
            onPress={() => notesSelected.length && setConfirmModal(true)}
            source={require('../assets/trashIcon.png')}
          />
          <MyButton
            color="transparent"
            source={require('../assets/checkAllIcon.png')}
            dimensions={24}
            containerStyle={{position: 'relative'}}
            onPress={() => setCheckAll(prev => !prev)}
          />
        </BottomOptionsBar>
      ) : (
        <AddB
          containerStyle={{padding: 15, bottom: 30}}
          dimensions={32}
          onPress={() => {
            setNote({} as groupNotesType);
            setNoteModal(true);
          }}
        />
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  scrollView: {paddingTop: 15, paddingHorizontal: 5, paddingBottom: 85},
  listsCon: {flexDirection: 'row', justifyContent: 'space-between'},
  list: {width: '49%'},
  pinnedTitle: {fontSize: 17, left: 10, marginBottom: 15},
  othersTittle: {fontSize: 17, left: 10, marginBottom: 15, marginTop: 15},
});

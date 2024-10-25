import {Image, ScrollView, View} from 'react-native';
import {useState} from 'react';

import {useMyStore} from '../../store';
import {
  AdminModal,
  Background,
  ConfirmModal,
  MyButton,
  Option,
  OptionsBar,
} from '../components';
import colors from '../config/colors';
import {
  _getMembersGroup,
  _deleteMemberGroup,
  _deleteAllMembersGroup,
  _changeAdminGroup,
} from '../api/Groups';
import {ManageMembersScreenProps} from '../navigation/HomeStack';
import socket from '../utils/socket';

export default function ManageMembersScreen({
  navigation,
}: ManageMembersScreenProps) {
  const {members, groupId, userId, groupAdminId, toggleLoading} = useMyStore();
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [all, setAll] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [adminTo, setAdminTo] = useState(groupAdminId);
  const [deleteId, setDeleteId] = useState('');

  async function deleteMemberGroup() {
    toggleLoading(true);
    await _deleteMemberGroup(groupId, deleteId);
    socket.emit('removemember', {member: deleteId, groupId});
    toggleLoading(false);
  }

  async function deleteAllMembersGroup() {
    toggleLoading(true);
    await _deleteAllMembersGroup(groupId, userId);
    socket.emit('removemembers', {
      members: members
        .filter(m => m.userId !== groupAdminId)
        .map(m => m.userId),
      groupId,
    });
    toggleLoading(false);
  }

  async function changeAdminGroup() {
    await _changeAdminGroup(groupId, adminTo);
    socket.emit('updateadmin', {member: adminTo, groupId});
    setAdminModal(false);
    navigation.navigate('SettingsScreen');
  }

  const memberList = members
    .sort((a, b) => a.nickname.localeCompare(b.nickname))
    .map(item => {
      return (
        <Option
          containerStyle2={{backgroundColor: colors.background}}
          key={item.userId}
          text={item.nickname}
          textStyle={{width: 320}}
          onPress={() => {
            if (userId !== item.userId) {
              setConfirmText(`Remove ${item.nickname} ?`);
              setDeleteId(item.userId);
              setAll(false);
              setConfirmModal(true);
            }
          }}>
          {userId !== item.userId && (
            <View style={{position: 'absolute', right: 15}}>
              <Image
                style={{width: 22, height: 22}}
                source={require('../assets/trashIcon.png')}
              />
            </View>
          )}
          {item.userId === groupAdminId && (
            <View style={{position: 'absolute', right: 15}}>
              <Image
                style={{
                  width: 24,
                  height: 24,
                  left: 0.5,
                  tintColor: colors.details,
                }}
                source={require('../assets/adminIcon.png')}
              />
            </View>
          )}
        </Option>
      );
    });
  /////////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      <AdminModal
        adminTo={adminTo}
        close={() => setAdminModal(false)}
        openConfirmModal={() => setConfirmModal(true)}
        setAdminTo={setAdminTo}
        visible={adminModal}
      />
      <ConfirmModal
        close={() => {
          setConfirmModal(false);
          adminModal && setAdminTo(groupAdminId);
        }}
        text={
          adminModal
            ? `Make ${members.find(m => m.userId === adminTo)
                ?.nickname} admin ?`
            : confirmText
        }
        visible={confirmModal}
        confirm={
          adminModal
            ? changeAdminGroup
            : all
            ? deleteAllMembersGroup
            : deleteMemberGroup
        }
      />
      <OptionsBar>
        <MyButton
          containerStyle={{left: 5}}
          onPress={navigation.goBack}
          source={require('../assets/backArrowIcon.png')}
        />
        <MyButton
          containerStyle={{right: 5}}
          source={require('../assets/trashIcon.png')}
          onPress={() => {
            setAll(true);
            setConfirmText('Remove all members?');
            setConfirmModal(true);
          }}
        />
        <MyButton
          dimensions={25}
          containerStyle={{right: 50, padding: 9}}
          source={require('../assets/adminIcon.png')}
          onPress={() => setAdminModal(true)}
        />
        <MyButton
          containerStyle={{right: 96}}
          onPress={() => navigation.navigate('AddMemberScreen')}
          source={require('../assets/addMemberIcon.png')}
        />
      </OptionsBar>
      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
        {memberList}
      </ScrollView>
    </Background>
  );
}

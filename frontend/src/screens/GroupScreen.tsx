import {useState} from 'react';
import {StyleSheet, BackHandler} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import EncryptedStorage from 'react-native-encrypted-storage';
import Auth0 from 'react-native-auth0';
import messaging from '@react-native-firebase/messaging';

import {useMyStore} from '../../store';
import {_deleteGroup, _deleteMemberGroup} from '../api/Groups';
import {Background, ConfirmModal, MyButton, RippleB} from '../components';
import {GroupScreenPropsHomeStack} from '../navigation/HomeStack';
import {GroupScreenPropsLaunchStack} from '../navigation/LaunchStack';
import socket from '../utils/socket';
import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {EffectBackHandler} from '../utils';

export default function GroupScreen() {
  const toast = useToast();
  const homeStackNavigation = useNavigation<GroupScreenPropsHomeStack>();
  const launchStackNavigation = useNavigation<GroupScreenPropsLaunchStack>();
  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  const {
    groupId,
    groupAdminId,
    userId,
    loggedIn,
    setUsername,
    setUserId,
    members,
    setEmail,
    setBirthdate,
  } = useMyStore();
  const [confirmModalFunc, setConfirmModalFunc] = useState<Function>(
    () => null,
  );
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmModalText, setConfirmModalText] = useState('');

  EffectBackHandler(() => {
    toast.hideAll();
    loggedIn ? homeStackNavigation.goBack() : BackHandler.exitApp();
  });

  async function LeaveGroup() {
    await _deleteMemberGroup(groupId, userId);
    socket.emit('removemember', {member: userId, groupId});
  }

  async function DisbandGroup() {
    await _deleteGroup(groupId);
    socket.emit('removemembers', {
      members: members.map(m => m.userId),
      groupId,
    });
  }
  ////////////////////////////////////////////////////////////////////////
  return (
    <Background style={styles.container}>
      <ConfirmModal
        text={confirmModalText}
        visible={confirmModal}
        close={() => setConfirmModal(false)}
        confirm={() => {
          confirmModalFunc();
        }}
      />
      <MyButton
        onPress={async () => {
          toast.hideAll();
          if (loggedIn) {
            homeStackNavigation.goBack();
          } else {
            const refreshToken =
              (await EncryptedStorage.getItem('refreshToken')) || '';
            await messaging().unsubscribeFromTopic(userId);
            auth0.auth.revoke({refreshToken: refreshToken});
            await EncryptedStorage.clear();
            setUserId('');
            setUsername('');
            setEmail('');
            setBirthdate('');
            launchStackNavigation.navigate('LaunchScreen');
          }
        }}
        source={
          loggedIn
            ? require('../assets/backArrowIcon.png')
            : require('../assets/logoutIcon.png')
        }
        containerStyle={styles.signOutB}
      />
      {!loggedIn && (
        <MyButton
          source={require('../assets/idIcon.png')}
          onPress={() => {
            toast.hideAll();
            launchStackNavigation.navigate('AccountSettingsScreen');
          }}
          containerStyle={styles.accountB}
          dimensions={25}
          iconStyle={styles.accountBicon}
        />
      )}
      <RippleB
        style={styles.JoinGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        text="Join group"
        onPress={() => {
          toast.hideAll();
          loggedIn
            ? homeStackNavigation.navigate('JoinGroupScreen')
            : launchStackNavigation.navigate('JoinGroupScreen');
        }}
      />
      <RippleB
        style={styles.CreateGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        onPress={() => {
          toast.hideAll();
          loggedIn
            ? homeStackNavigation.navigate('CreateGroupScreen')
            : launchStackNavigation.navigate('CreateGroupScreen');
        }}
        text="Create group"
      />
      {loggedIn && groupAdminId === userId && (
        <RippleB
          style={{marginTop: 20}}
          style2={styles.LeaveGrB}
          textStyle={styles.textB}
          text="Disband group"
          onPress={() => {
            setConfirmModalText('Disband this group ?');
            setConfirmModalFunc(() => DisbandGroup);
            setConfirmModal(true);
          }}
        />
      )}
      {loggedIn && groupAdminId !== userId && (
        <RippleB
          style={{marginTop: 20}}
          style2={styles.LeaveGrB}
          textStyle={styles.textB}
          text="Leave group"
          onPress={() => {
            setConfirmModalText('Leave this group ?');
            setConfirmModalFunc(() => LeaveGroup);
            setConfirmModal(true);
          }}
        />
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {justifyContent: 'center', alignItems: 'center'},
  LaunchBs: {width: 300, paddingVertical: 20},
  CreateGrB: {marginTop: 20},
  LeaveGrB: {width: 200, paddingVertical: 15},
  JoinGrB: {},
  textB: {fontSize: 20, fontWeight: '500'},
  signOutB: {top: 5.5, left: 5},
  accountB: {top: 5.5, right: 5, padding: 9},
  accountBicon: {top: 3},
});

import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useToast} from 'react-native-toast-notifications';
import EncryptedStorage from 'react-native-encrypted-storage';
import moment from 'moment';
import Auth0 from 'react-native-auth0';
import Clipboard from '@react-native-clipboard/clipboard';
import messaging from '@react-native-firebase/messaging';

import {useMyStore} from '../../store';
import {
  BackB,
  Background,
  ConfirmModal,
  MyButton,
  RippleB,
} from '../components';
import {AccountSettingsScreenPropsHomeStack} from '../navigation/HomeStack';
import {AccountSettingsScreenPropsLaunchStack} from '../navigation/LaunchStack';
import {
  _deleteUser,
  _getPasswordUser,
  _updateBirthdateUser,
} from '../api/Users';
import socket from '../utils/socket';
import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {EffectBackHandler} from '../utils';

export default function AccountSettingsScreen() {
  const {
    loggedIn,
    userId,
    birthdate,
    setBirthdate,
    toggleLoading,
    setUserId,
    setUsername,
    setGroups,
    groups,
    setEmail,
    email,
  } = useMyStore();
  const [datePicker, setDatePicker] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const date = !birthdate ? new Date() : new Date(birthdate);
  const toast = useToast();
  const homeStackNavigation =
    useNavigation<AccountSettingsScreenPropsHomeStack>();
  const launchStackNavigation =
    useNavigation<AccountSettingsScreenPropsLaunchStack>();
  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  async function updateBirthdateUser(date: Date) {
    const newBirthdate = moment(date).format('YYYY-MM-DD');
    if (birthdate !== newBirthdate) {
      toggleLoading(true);
      await _updateBirthdateUser(userId, newBirthdate);
      setBirthdate(newBirthdate);
      const psw = await _getPasswordUser(userId);
      let refreshToken = (await EncryptedStorage.getItem('refreshToken')) || '';
      auth0.auth.revoke({refreshToken: refreshToken});
      const result = await auth0.auth.passwordRealm({
        username: email,
        password: psw,
        realm: 'Username-Password-Authentication',
        scope: 'openid profile email offline_access',
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      });
      refreshToken = result.refreshToken || '';
      const idToken = result.idToken || '';
      const accessToken = result.accessToken;
      await EncryptedStorage.setItem('accessToken', accessToken);
      await EncryptedStorage.setItem('idToken', idToken);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      socket.emit('updatebirthdate', {
        member: userId,
        birthdate: newBirthdate,
        groups: groups.map(g => g._id),
      });
      toggleLoading(false);
      toast.show('Birthdate changed !', {type: 'success'});
    }
  }

  async function deleteUser() {
    toast.hideAll();
    const del = await _deleteUser(userId);
    if (!del) {
      toast.show('Account deleted !', {type: 'success'});
      socket.emit('deleteaccount', {
        member: userId,
        groups: groups.map(g => g._id),
      });
      const refreshToken =
        (await EncryptedStorage.getItem('refreshToken')) || '';
      auth0.auth.revoke({refreshToken: refreshToken});
      await EncryptedStorage.clear();
      await messaging().unsubscribeFromTopic(userId);
      setUserId('');
      setUsername('');
      setEmail('');
      setBirthdate('');
      setGroups([]);
      !loggedIn && launchStackNavigation.navigate('LaunchScreen');
    } else {
      toast.show('Action failed.\nYou are admin of a group.', {
        type: 'warning',
      });
    }
  }

  EffectBackHandler(() => {
    toast.hideAll();
    loggedIn ? homeStackNavigation.goBack() : launchStackNavigation.goBack();
  });
  ////////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={styles.container}>
      <ConfirmModal
        close={() => setConfirmModal(false)}
        text="Delete account ?"
        visible={confirmModal}
        confirm={deleteUser}
      />
      <DatePicker
        modal
        locale="en-GB"
        open={datePicker}
        date={date}
        androidVariant="nativeAndroid"
        onConfirm={datee => {
          setDatePicker(false);
          updateBirthdateUser(datee);
        }}
        onCancel={() => setDatePicker(false)}
        mode="date"
      />
      <BackB
        onPress={() => {
          toast.hideAll();
          loggedIn
            ? homeStackNavigation.goBack()
            : launchStackNavigation.goBack();
        }}
      />
      <MyButton
        containerStyle={styles.idB}
        text={'ID'}
        onPress={() =>
          loggedIn
            ? homeStackNavigation.navigate('IdScreen')
            : launchStackNavigation.navigate('IdScreen')
        }
      />
      <RippleB
        style={styles.JoinGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        text="Change username"
        onPress={() =>
          loggedIn
            ? homeStackNavigation.navigate('ChangeUsernameScreen')
            : launchStackNavigation.navigate('ChangeUsernameScreen')
        }
      />
      <RippleB
        style={styles.CreateGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        text="Birthdate"
        onPress={() => setDatePicker(true)}
      />
      <RippleB
        style={styles.CreateGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        onPress={() => Clipboard.setString(userId)}
        text="Copy ID"
      />
      <RippleB
        style={styles.CreateGrB}
        style2={styles.LaunchBs}
        textStyle={styles.textB}
        onPress={() => setConfirmModal(true)}
        text="Delete account"
      />
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
  idB: {top: 5.5, right: 5, width: 40, height: 42, justifyContent: 'center'},
});

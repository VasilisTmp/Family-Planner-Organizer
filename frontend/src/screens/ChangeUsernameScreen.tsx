import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Auth0 from 'react-native-auth0';

import {useMyStore} from '../../store';
import {_updateMemberNicknameGroup} from '../api/Groups';
import {_getPasswordUser, _updateUsernameUser} from '../api/Users';
import {BackB, Background, RippleB} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {ChangeUsernameScreenPropsHomeStack} from '../navigation/HomeStack';
import {ChangeUsernameScreenPropsLaunchStack} from '../navigation/LaunchStack';
import socket from '../utils/socket';
import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {EffectBackHandler} from '../utils';

export default function ChangeUsernameScreen() {
  const {
    userId,
    username,
    setUsername,
    loggedIn,
    groups,
    toggleLoading,
    email,
  } = useMyStore();

  const [disabled, setDisabled] = useState(false);
  const [text, setText] = useState(username);

  const homeStackNavigation =
    useNavigation<ChangeUsernameScreenPropsHomeStack>();
  const launchStackNavigation =
    useNavigation<ChangeUsernameScreenPropsLaunchStack>();
  const usernameRegex = /^[A-Za-zα-ωΑ-Ω\d]+[A-Za-zα-ωΑ-Ω\d' ']*$/;
  const toast = useToast();
  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  EffectBackHandler(
    loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack,
  );

  async function updateUsernameUser() {
    if (text !== username) {
      toggleLoading(true);
      toast.hideAll();
      await _updateUsernameUser(userId, text);
      socket.emit('updateusername', {
        member: userId,
        value: text,
        groups: groups.map(g => g._id),
      });
      setUsername(text);
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
      toggleLoading(false);
      toast.show('Username changed succesfully!', {type: 'success'});
      loggedIn ? homeStackNavigation.goBack() : launchStackNavigation.goBack();
    }
  }
  ///////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB
        onPress={
          loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack
        }
      />
      <View style={styles.container}>
        <View>
          <Text style={[styles.placeholders, globalStyles.text]}>Username</Text>
          <TextInput
            defaultValue={text}
            autoCorrect={false}
            style={[styles.inputs, globalStyles.text]}
            onChangeText={e => {
              e.trim() ? setDisabled(false) : setDisabled(true);
              setText(e.trim());
            }}
          />
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 15,
          }}>
          <RippleB
            disabled={disabled}
            color={colors.details}
            rippleColor={colors.ripple2}
            textStyle={styles.finalBtext}
            text="Change"
            style2={[styles.finalBcon2, {opacity: disabled ? 0.5 : 1}]}
            onPress={() => usernameRegex.test(text) && updateUsernameUser()}
          />
          <RippleB
            color={colors.tertiary}
            rippleColor={colors.ripple2}
            textStyle={styles.finalBtext}
            text="Cancel"
            style2={styles.finalBcon2}
            onPress={
              loggedIn
                ? homeStackNavigation.goBack
                : launchStackNavigation.goBack
            }
          />
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 100, alignItems: 'center'},
  placeholders: {fontSize: 17, marginBottom: 10},
  inputs: {
    width: 300,
    marginBottom: 15,
    borderWidth: 1,
    padding: 13,
    fontSize: 20,
    borderColor: colors.text,
    borderRadius: 5,
  },
  finalBcon2: {width: 150, paddingVertical: 15},
  finalBtext: {fontSize: 18, fontWeight: '500'},
});

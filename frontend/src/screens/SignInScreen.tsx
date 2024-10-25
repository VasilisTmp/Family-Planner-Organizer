import {StyleSheet, Text, View, TextInput} from 'react-native';
import {useEffect, useState} from 'react';
const CryptoJS = require('crypto-js');
import {useToast} from 'react-native-toast-notifications';
import EncryptedStorage from 'react-native-encrypted-storage';
import jwtDecode from 'jwt-decode';
import Auth0 from 'react-native-auth0';
import messaging from '@react-native-firebase/messaging';

import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {BackB, Background, RippleB} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {useMyStore} from '../../store';
import {_getGroupsUser, _logInUser} from '../api/Users';
import {SignInScreenProps} from '../navigation/LaunchStack';
import socket from '../utils/socket';

export default function SignInScreen({navigation}: SignInScreenProps) {
  const toast = useToast();

  useEffect(() => {
    toast.hideAll();
  }, []);

  const {
    setUserId,
    setUsername,
    setGroups,
    setBirthdate,
    toggleLoading,
    setEmail,
  } = useMyStore();
  const [disabled, setDisabled] = useState(true);
  const [password, setPassword] = useState('');
  const [emaill, setEmaill] = useState('');
  const [emailColor, setEmailColor] = useState(colors.text);

  const emailRegex =
    /^[A-Za-z](['_'-\.]?[A-Za-z\d]+)+@(\d*[A-Za-z]+\d*)+((-[\dA-Za-z]+)|((\.(\d*[A-Za-z]+\d*)+)*))\.[A-Za-z]{2,3}$/;

  function EmailValidator(email: string) {
    return emailRegex.test(email) ? true : false;
  }

  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  const handleLogin = async () => {
    const encryptedPassword = CryptoJS.SHA3(password).toString();
    try {
      toggleLoading(true);
      const result = await auth0.auth.passwordRealm({
        username: emaill,
        password: encryptedPassword,
        realm: 'Username-Password-Authentication',
        scope: 'openid profile email offline_access',
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      });
      const refreshToken = result.refreshToken || '';
      const idToken = result.idToken || '';
      const accessToken = result.accessToken;
      await EncryptedStorage.setItem('accessToken', accessToken);
      await EncryptedStorage.setItem('idToken', idToken);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      const decodedIT: any = jwtDecode(idToken);
      const userId = decodedIT.sub.split('|')[1];
      setUserId(userId);
      setUsername(decodedIT.nickname);
      setBirthdate(decodedIT.birthdate);
      setEmail(emaill);
      const getGroupsUser = await _getGroupsUser(userId);
      setGroups(getGroupsUser);
      socket.emit('joinPrivate', userId);
      await messaging().subscribeToTopic(userId);
      toggleLoading(false);
      navigation.navigate('GroupScreen');
      toast.hideAll();
      toast.show('Sign in was successfull !', {type: 'success'});
    } catch (error) {
      toggleLoading(false);
      console.log('error', error);
      toast.hideAll();
      toast.show('Sign in was unsuccessfull.\nPlease try again.', {
        type: 'warning',
      });
    }
  };
  ///////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB onPress={navigation.goBack} />
      <View style={styles.container}>
        <View>
          {/* <RippleB
          text="qew"
          onPress={() => {
            email.current = 'qwe@qwe.qwe';
            password.current = 'qwe';
            handleLogin();
            }}
            style={{marginBottom: 15}}
            />
            <RippleB
            text="asd"
            onPress={() => {
              email.current = 'asd@asd.asd';
              password.current = 'asd';
              handleLogin();
              }}
              style={{marginBottom: 15}}
              />
              <RippleB
              text="zxc"
              onPress={() => {
                email.current = 'zxc@zxc.zxc';
                password.current = 'zxc';
                handleLogin();
                }}
                /> */}
          <Text style={[styles.placeholders, globalStyles.text]}>E-mail</Text>
          <TextInput
            defaultValue={emaill}
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={text => {
              setEmaill(text.trim());
              EmailValidator(text.trim())
                ? setEmailColor(colors.text)
                : setEmailColor('red');
              EmailValidator(text.trim()) && password
                ? setDisabled(false)
                : setDisabled(true);
            }}
            autoCorrect={false}
            style={[
              styles.inputs,
              globalStyles.text,
              {borderColor: emailColor},
            ]}
          />
          <Text style={[styles.placeholders, globalStyles.text]}>Password</Text>
          <TextInput
            autoCorrect={false}
            onChangeText={text => {
              setPassword(text.trim());
              EmailValidator(emaill) && text.trim()
                ? setDisabled(false)
                : setDisabled(true);
            }}
            secureTextEntry
            style={[
              styles.inputs,
              globalStyles.text,
              {borderColor: colors.text},
            ]}
          />
        </View>
        <RippleB
          disabled={disabled}
          color={colors.tertiary}
          rippleColor={colors.ripple2}
          style={styles.signInB}
          style2={[styles.LaunchBs, {opacity: disabled ? 0.5 : 1}]}
          textStyle={styles.textB}
          text="Sign in"
          onPress={() => EmailValidator(emaill) && password && handleLogin()}
        />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 100},
  LaunchBs: {width: 300, paddingVertical: 20},
  signInB: {marginTop: 15},
  textB: {fontSize: 20, fontWeight: '500'},
  placeholders: {fontSize: 17, marginBottom: 10},
  inputs: {
    width: 300,
    marginBottom: 15,
    borderWidth: 1,
    padding: 13,
    fontSize: 20,
    borderRadius: 5,
  },
});

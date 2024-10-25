import {StyleSheet, Text, View, TextInput} from 'react-native';
import {useState} from 'react';
import {useToast} from 'react-native-toast-notifications';
var CryptoJS = require('crypto-js');

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {BackB, Background, RippleB} from '../components';
import {_newUser} from '../api/Users';
import {SignUpScreenProps} from '../navigation/LaunchStack';

export default function SignUpScreen({navigation}: SignUpScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailColor, setEmailColor] = useState(colors.text);
  const [usernameColor, setUsernameColor] = useState(colors.text);

  const toast = useToast();
  const [disabled, setDisabled] = useState(true);
  const usernameRegex = /^[A-Za-zα-ωΑ-Ω\d]+[A-Za-zα-ωΑ-Ω\d' ']*$/;
  const emailRegex =
    /^[A-Za-z](['_'-\.]?[A-Za-z\d]+)+@(\d*[A-Za-z]+\d*)+((-[\dA-Za-z]+)|((\.(\d*[A-Za-z]+\d*)+)*))\.[A-Za-z]{2,3}$/;

  function UsernameValidator(username: string) {
    return usernameRegex.test(username);
  }

  function EmailValidator(email: string) {
    return emailRegex.test(email);
  }

  async function newUser() {
    const encryptedPassword = CryptoJS.SHA3(password).toString();
    const user = await _newUser(username, email, encryptedPassword);
    if (user) {
      toast.hideAll();
      toast.show('Account created successfully !', {type: 'success'});
      navigation.goBack();
    } else {
      toast.hideAll();
      toast.show('Account already exists,\nplease try again.', {
        type: 'warning',
      });
    }
  }
  //////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB onPress={navigation.goBack} />
      <View style={styles.container}>
        <View>
          <Text style={[styles.placeholders, globalStyles.text]}>Username</Text>
          <TextInput
            defaultValue={username}
            autoComplete="username"
            onChangeText={text => {
              setUsername(text.trim());
              UsernameValidator(text.trim())
                ? setUsernameColor(colors.text)
                : setUsernameColor('red');
              EmailValidator(email) &&
              UsernameValidator(text.trim()) &&
              password
                ? setDisabled(false)
                : setDisabled(true);
            }}
            autoCorrect={false}
            style={[
              styles.inputs,
              globalStyles.text,
              {borderColor: usernameColor},
            ]}
          />
          <Text style={[styles.placeholders, globalStyles.text]}>E-mail</Text>
          <TextInput
            defaultValue={email}
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={text => {
              setEmail(text.trim());
              EmailValidator(text)
                ? setEmailColor(colors.text)
                : setEmailColor('red');
              EmailValidator(text.trim()) &&
              UsernameValidator(username) &&
              password
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
            defaultValue={password}
            autoCorrect={false}
            onChangeText={text => {
              setPassword(text.trim());
              EmailValidator(email) &&
              UsernameValidator(username) &&
              text.trim()
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
          color={colors.details}
          rippleColor={colors.ripple2}
          style={styles.signUpB}
          style2={[styles.LaunchBs, {opacity: disabled ? 0.5 : 1}]}
          textStyle={styles.textB}
          text="Sign up"
          onPress={() =>
            UsernameValidator(username) &&
            EmailValidator(email) &&
            password &&
            newUser()
          }
        />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 50},
  LaunchBs: {width: 300, paddingVertical: 20},
  signUpB: {marginTop: 15},
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

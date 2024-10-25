import {StyleSheet, Text, View} from 'react-native';
import {useToast} from 'react-native-toast-notifications';
import EncryptedStorage from 'react-native-encrypted-storage';
import Auth0 from 'react-native-auth0';
import messaging from '@react-native-firebase/messaging';

import {useMyStore} from '../../store';
import {MyButton, OptionWithIcon, OptionsBar, Background} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {SettingsScreenProps} from '../navigation/HomeStack';
import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {EffectBackHandler} from '../utils';

export default function SettingsScreen({navigation}: SettingsScreenProps) {
  const {
    logOut,
    groupAdminId,
    userId,
    members,
    setUsername,
    setUserId,
    setGroups,
    groupId,
    setEmail,
    setBirthdate,
    toggleLoading,
  } = useMyStore();

  const toast = useToast();
  const nickName = members.find(member => member.userId === userId)?.nickname;
  const color = members.find(member => member.userId === userId)?.color;
  const auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENTID,
  });

  EffectBackHandler(() => {
    toast.hideAll();
    navigation.goBack();
  });
  ///////////////////////////////////////////////////////////////////////////////
  return (
    <Background>
      <OptionsBar>
        <MyButton
          containerStyle={{left: 5}}
          onPress={() => {
            toast.hideAll();
            navigation.goBack();
          }}
          source={require('../assets/backArrowIcon.png')}
        />
        <Text
          numberOfLines={1}
          style={[
            globalStyles.text,
            {fontSize: 20, marginLeft: 55, color: color, maxWidth: '80%'},
          ]}>
          {nickName}
        </Text>
      </OptionsBar>
      <View style={{flex: 1}}>
        <OptionWithIcon
          iconStyle={{width: 26, height: 26}}
          color={colors.background}
          containerStyle2={styles.optionContainerStyle2}
          text="Change nickname"
          source={require('../assets/editUserIcon.png')}
          onPress={() => {
            toast.hideAll();
            navigation.navigate('ChangeNicknameScreen');
          }}
        />
        <OptionWithIcon
          color={colors.background}
          containerStyle2={styles.optionContainerStyle2}
          text="Change color"
          source={require('../assets/colorsIcon.png')}
          onPress={() => {
            toast.hideAll();
            navigation.navigate('ChangeColorScreen');
          }}
        />
        <OptionWithIcon
          color={colors.background}
          containerStyle2={styles.optionContainerStyle2}
          text="Birthdays"
          source={require('../assets/birthdaysIcon.png')}
          onPress={() => {
            toast.hideAll();
            navigation.navigate('BirthdatesScreen');
          }}
        />
        <OptionWithIcon
          color={colors.background}
          source={require('../assets/groupOptionsIcon.png')}
          containerStyle2={styles.optionContainerStyle2}
          text="Group options"
          onPress={() => {
            toast.hideAll();
            navigation.navigate('GroupScreen');
          }}
        />
        {groupAdminId === userId && (
          <OptionWithIcon
            color={colors.background}
            containerStyle2={styles.optionContainerStyle2}
            source={require('../assets/manageMembersIcon.png')}
            text="Manage members"
            onPress={() => {
              toast.hideAll();
              navigation.navigate('ManageMembersScreen');
            }}
          />
        )}
        <OptionWithIcon
          color={colors.background}
          source={require('../assets/idIcon.png')}
          containerStyle2={styles.optionContainerStyle2}
          text="Account Settings"
          iconStyle={{top: 4}}
          onPress={() => {
            toast.hideAll();
            navigation.navigate('AccountSettingsScreen');
          }}
        />
        <OptionWithIcon
          containerStyle={styles.signOutB}
          color={colors.secondary}
          containerStyle2={styles.signOutB2}
          iconStyle={{left: 1}}
          source={require('../assets/logoutIcon.png')}
          text="Sign out "
          onPress={async () => {
            toggleLoading(true);
            await messaging().unsubscribeFromTopic(groupId);
            await messaging().unsubscribeFromTopic(userId);
            setUserId('');
            logOut();
            toast.hideAll();
            const refreshToken =
              (await EncryptedStorage.getItem('refreshToken')) || '';
            auth0.auth.revoke({refreshToken: refreshToken});
            await EncryptedStorage.clear();
            setUsername('');
            setEmail('');
            setBirthdate('');
            setGroups([]);
            toggleLoading(false);
          }}
        />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  signOutB: {marginTop: 75},
  signOutB2: {borderBottomWidth: 0},
  optionContainerStyle2: {
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
  },
});

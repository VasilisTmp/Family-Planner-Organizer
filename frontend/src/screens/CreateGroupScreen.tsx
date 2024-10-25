import {StyleSheet, Text, View, TextInput} from 'react-native';
import {useState} from 'react';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';

import {useMyStore} from '../../store';
import {_newGroup, randomColor} from '../api/Groups';
import {BackB, RippleB, Background} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {CreateGroupScreenPropsHomeStack} from '../navigation/HomeStack';
import {CreateGroupScreenPropsLaunchStack} from '../navigation/LaunchStack';
import {EffectBackHandler} from '../utils';

export default function CreateGroupScreen() {
  const homeStackNavigation = useNavigation<CreateGroupScreenPropsHomeStack>();
  const launchStackNavigation =
    useNavigation<CreateGroupScreenPropsLaunchStack>();
  const toast = useToast();
  const regex = /^[A-Za-zα-ωΑ-Ω\d]+[A-Za-zα-ωΑ-Ω\d' ']*$/;

  const {
    userId,
    username,
    groups,
    setGroups,
    toggleLoading,
    birthdate,
    loggedIn,
  } = useMyStore();
  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState('');

  EffectBackHandler(
    loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack,
  );

  async function newGroup() {
    toggleLoading(true);
    const group = await _newGroup(name, userId, {
      userId: userId,
      nickname: username,
      color: randomColor(),
      birthdate: birthdate,
    });
    if (group) {
      setGroups([...groups, group]);
      toast.show('Group created successfully!', {type: 'success'});
      loggedIn ? homeStackNavigation.goBack() : launchStackNavigation.goBack();
    }
    toggleLoading(false);
  }
  /////////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB
        onPress={
          loggedIn ? homeStackNavigation.goBack : launchStackNavigation.goBack
        }
      />
      <View style={styles.container}>
        <View>
          <Text style={[styles.placeholders, globalStyles.text]}>
            Group name
          </Text>
          <TextInput
            defaultValue={name}
            onChangeText={text => {
              regex.test(text.trim()) ? setDisabled(false) : setDisabled(true);
              setName(text.trim());
            }}
            autoCorrect={false}
            style={[styles.inputs, globalStyles.text]}
          />
        </View>
        <RippleB
          disabled={disabled}
          style={styles.CreateGrB}
          style2={[styles.LaunchBs, {opacity: disabled ? 0.5 : 1}]}
          textStyle={styles.textB}
          text="Create group"
          onPress={() => regex.test(name) && newGroup()}
        />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 100},
  LaunchBs: {width: 300, paddingVertical: 20},
  CreateGrB: {marginTop: 15},
  textB: {fontSize: 20, fontWeight: '500'},
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
});

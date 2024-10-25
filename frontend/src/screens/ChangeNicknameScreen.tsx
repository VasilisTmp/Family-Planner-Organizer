import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useToast} from 'react-native-toast-notifications';

import {useMyStore} from '../../store';
import {_updateMemberNicknameGroup} from '../api/Groups';
import {BackB, Background, RippleB} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {ChangeNicknameScreenProps} from '../navigation/HomeStack';
import socket from '../utils/socket';

export default function ChangeNicknameScreen({
  navigation,
}: ChangeNicknameScreenProps) {
  const {members, userId, groupId, username} = useMyStore();
  const [disabled, setDisabled] = useState(false);
  const member = members.find(member => member.userId === userId);
  const nickname = member?.nickname || '';
  const [text, setText] = useState(nickname);
  const nicknameRegex = /^[A-Za-zα-ωΑ-Ω\d' ']*$/;
  const toast = useToast();

  async function updateMemberNicknameGroup() {
    if (text !== nickname) {
      const name = text || username;
      toast.hideAll();
      await _updateMemberNicknameGroup(groupId, userId, name, username);
      if (member) {
        name === username
          ? (member.originalname = true)
          : (member.originalname = false);
        member.nickname = name;
        toast.show('Nickname changed succesfully!', {type: 'success'});
        socket.emit('updatenickname', {member: member, groupId});
        navigation.goBack();
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB onPress={navigation.goBack} />
      <View style={styles.container}>
        <View>
          <Text style={[styles.placeholders, globalStyles.text]}>Nickname</Text>
          <TextInput
            defaultValue={text}
            autoCorrect={false}
            style={[styles.inputs, globalStyles.text]}
            onChangeText={e => {
              nicknameRegex.test(e.trim())
                ? setDisabled(false)
                : setDisabled(true);
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
            onPress={() =>
              nicknameRegex.test(text) && updateMemberNicknameGroup()
            }
          />
          <RippleB
            color={colors.tertiary}
            rippleColor={colors.ripple2}
            textStyle={styles.finalBtext}
            text="Cancel"
            style2={styles.finalBcon2}
            onPress={navigation.goBack}
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

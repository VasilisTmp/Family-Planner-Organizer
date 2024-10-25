import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useToast} from 'react-native-toast-notifications';
import {useState} from 'react';

import {BackB, Background, RippleB} from '../components';
import colors from '../config/colors';
import globalStyles from '../config/globalStyles';
import {useMyStore} from '../../store';
import {_addMemberGroup} from '../api/Groups';
import {AddMemberScreenProps} from '../navigation/HomeStack';
import socket from '../utils/socket';

export default function AddMemberScreen({navigation}: AddMemberScreenProps) {
  const {members, groupId, groups} = useMyStore();
  const [disabled, setDisabled] = useState(true);
  const [text, setText] = useState('');

  const toast = useToast();
  const regex = /^[0-9a-fA-F]{24}$/;

  async function addMemberGroup() {
    if (members.some(member => member.userId === text)) {
      toast.hideAll();
      toast.show('Member already exists.', {type: 'warning'});
    } else {
      const member = await _addMemberGroup(groupId, text);
      if (member) {
        socket.emit('newmember', {
          member,
          group: groups.find(g => g._id === groupId),
          groupId,
        });
        toast.hideAll();
        toast.show('Member added succesfully !', {type: 'success'});
        setText('');
      } else {
        toast.hideAll();
        toast.show(`This user doesn't exist.`, {type: 'warning'});
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB
        onPress={() => {
          toast.hideAll();
          navigation.goBack();
        }}
      />
      <View style={styles.container}>
        <View>
          <Text style={[styles.placeholders, globalStyles.text]}>
            Member ID
          </Text>
          <TextInput
            defaultValue={text}
            autoCorrect={false}
            style={[styles.inputs, globalStyles.text]}
            onChangeText={e => {
              regex.test(e.trim()) ? setDisabled(false) : setDisabled(true);
              setText(e.trim());
            }}
          />
        </View>
        <RippleB
          disabled={disabled}
          style={styles.CreateGrB}
          style2={[styles.LaunchBs, {opacity: disabled ? 0.5 : 1}]}
          textStyle={styles.textB}
          text="Add member"
          onPress={() => text && addMemberGroup()}
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

import {StyleSheet, View} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import {useRef, useState} from 'react';
import {useToast} from 'react-native-toast-notifications';

import {useMyStore} from '../../store';
import {BackB, Background, RippleB} from '../components';
import colors from '../config/colors';
import {_updateMemberColorGroup} from '../api/Groups';
import {ChangeColorScreenProps} from '../navigation/HomeStack';
import socket from '../utils/socket';

export default function ChangeColorScreen({
  navigation,
}: ChangeColorScreenProps) {
  const {members, userId, groupId, toggleLoading} = useMyStore();

  const toast = useToast();
  const member = members.find(member => member.userId === userId);
  const startColor = member?.color || '';
  const ref = useRef<ColorPicker>(null);
  const [color, setColor] = useState(startColor);

  async function updateMemberColorGroup() {
    if (color && color !== startColor) {
      toggleLoading(true);
      toast.hideAll();
      await _updateMemberColorGroup(groupId, userId, color);
      if (member) {
        member.color = color;
        socket.emit('updatecolor', {member: member, groupId});
        toast.show('Color changed succesfully!', {type: 'success'});
        toggleLoading(false);
        navigation.goBack();
      }
    }
  }
  ////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{alignItems: 'center'}}>
      <BackB onPress={navigation.goBack} />
      <View
        style={{
          top: 30,
          height: 500,
          width: '92%',
          marginTop: 16,
        }}>
        <ColorPicker
          ref={ref}
          color={startColor}
          noSnap={false}
          row={false}
          onColorChangeComplete={colorr => setColor(colorr)}
          thumbSize={60}
          gapSize={20}
          sliderSize={30}
          shadeSliderThumb
          palette={[
            '#000000',
            '#888888',
            '#ff0000',
            '#ff00ff',
            '#0000ff',
            '#0080ff',
            '#00ffff',
            '#007f00',
            '#00ff00',
            '#ffff00',
            '#ff8000',
          ]}
        />
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          top: 80,
        }}>
        <RippleB
          color={colors.details}
          rippleColor={colors.ripple2}
          textStyle={styles.finalBtext}
          text="Choose"
          style2={styles.finalBcon2}
          onPress={updateMemberColorGroup}
        />
        <RippleB
          color={colors.tertiary}
          rippleColor={colors.ripple2}
          textStyle={styles.finalBtext}
          text="Revert"
          style2={styles.finalBcon2}
          onPress={() => {
            toast.hideAll();
            setColor(startColor);
            ref.current?.revert();
          }}
        />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  finalBcon2: {width: 150, paddingVertical: 15},
  finalBtext: {fontSize: 18, fontWeight: '500'},
});

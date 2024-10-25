import {useEffect, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

import RippleB from './RippleB';

interface Props {
  visible: boolean;
  close: Function;
  text?: string;
  confirm?: Function;
  setText: Function;
}

export default function InputModal({
  visible,
  close,
  text = '',
  confirm = () => null,
  setText,
}: Props) {
  const [newText, setNewText] = useState(text);

  useEffect(() => {
    visible && setNewText(text);
  }, [visible]);
  /////////////////////////////////////////////////////////////////////
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
          }}>
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              backgroundColor: colors.secondary,
              width: 340,
              borderRadius: 25,
              paddingVertical: 25,
            }}>
            <TextInput
              autoCorrect={false}
              defaultValue={newText}
              onChangeText={textt => setNewText(textt.trim())}
              style={[
                globalStyles.text,
                {
                  flex: 1,
                  borderWidth: 2,
                  borderColor: colors.ripple,
                  paddingHorizontal: 15,
                  fontSize: 18,
                  marginBottom: 25,
                  marginHorizontal: 15,
                  borderRadius: 25,
                },
              ]}
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}>
              <RippleB
                disabled={!newText}
                color={colors.details}
                rippleColor={colors.ripple2}
                text="Confirm"
                style={[styles.finalBcon, {opacity: newText ? 1 : 0.5}]}
                style2={styles.finalBcon2}
                onPress={() => {
                  if (newText) {
                    setText(newText);
                    confirm();
                    close();
                  }
                }}
              />
              <RippleB
                color={colors.tertiary}
                rippleColor={colors.ripple2}
                text="Cancel"
                style={styles.finalBcon}
                style2={styles.finalBcon2}
                onPress={close}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  finalBcon2: {width: 120, borderRadius: 25},
  finalBcon: {borderRadius: 25},
});

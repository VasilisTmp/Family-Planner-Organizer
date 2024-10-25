import {Modal, View, StyleSheet, Text} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

import RippleB from './RippleB';

interface Props {
  text: string;
  visible: boolean;
  close: Function;
  confirm?: Function;
}

export default function ConfirmModal({
  text,
  visible,
  close,
  confirm = () => null,
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
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
          <Text
            style={[
              globalStyles.text,
              {
                textAlign: 'center',
                width: 340,
                fontSize: 18,
                marginBottom: 25,
                paddingHorizontal: 15,
              },
            ]}>
            {text}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            <RippleB
              color={colors.details}
              rippleColor={colors.ripple2}
              text="Confirm"
              style={styles.finalBcon}
              style2={styles.finalBcon2}
              onPress={() => {
                confirm();
                close();
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  finalBcon2: {width: 120, borderRadius: 25},
  finalBcon: {borderRadius: 25},
});

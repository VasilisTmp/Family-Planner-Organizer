import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import {useEffect, useState} from 'react';

import colors from '../config/colors';

interface Props {
  visible: boolean;
  close: Function;
  children?: React.ReactNode;
}

export default function OptionsModal({visible, close, children}: Props) {
  const {height} = Dimensions.get('window');

  const [panResponder, setPanResponder] = useState<PanResponderInstance>();
  const [position, setPosition] = useState(0);
  const [positiony, setPositiony] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    setPosition(0);
  }, [visible]);

  const onLayout = () => {
    setPanResponder(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          gestureState.dy + position > 0 &&
            setPosition(gestureState.dy + position);
          setPositiony(gestureState.dy);
          setSpeed(gestureState.vy);
        },
        onPanResponderRelease: (_, gestureState) => {
          positiony >= 55 || speed > 1.5 ? close() : setPosition(0);
        },
      }),
    );
  };

  ////////////////////////////////////////////////////////////////////////////
  return (
    <>
      {visible && (
        <View
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
            zIndex: 1,
          }}
        />
      )}
      <Modal
        transparent
        visible={visible}
        onRequestClose={() => close()}
        animationType="slide">
        <TouchableWithoutFeedback onPress={() => close()}>
          <View style={{flex: 1}} />
        </TouchableWithoutFeedback>
        <View
          {...panResponder?.panHandlers}
          onLayout={onLayout}
          style={[styles.optionsCon, {height: height / 2, bottom: -position}]}>
          <TouchableWithoutFeedback>
            <View>
              <View style={styles.baaaar} />
            </View>
          </TouchableWithoutFeedback>
          {children}
          <TouchableWithoutFeedback>
            <View style={{flex: 1}} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  optionsCon: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.secondary,
  },
  baaaar: {
    backgroundColor: colors.ripple,
    alignSelf: 'center',
    margin: 11,
    width: 40,
    height: 3,
    borderRadius: 100,
  },
});

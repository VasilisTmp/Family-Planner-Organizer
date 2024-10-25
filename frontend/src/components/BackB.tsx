import {StyleSheet} from 'react-native';

import MyButton from './MyButton';

type Props = {
  onPress?: Function;
};

export default function BackB({onPress}: Props) {
  return (
    <MyButton
      source={require('../assets/backArrowIcon.png')}
      onPress={onPress}
      containerStyle={[styles.backBcontainer]}
    />
  );
}

const styles = StyleSheet.create({
  backBcontainer: {top: 5.5, left: 5},
});

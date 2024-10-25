import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';

import colors from '../config/colors';
import MyButton from './MyButton';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  onPress?: Function;
  source?: ImageSourcePropType;
  activeColor?: string;
  color?: string;
  dimensions?: number;
}

export default function AddB({
  containerStyle,
  iconStyle,
  onPress = () => null,
  source = require('../assets/addIcon.png'),
  activeColor = colors.ripple,
  color = colors.tertiary,
  dimensions = 42,
}: Props) {
  return (
    <MyButton
      dimensions={dimensions}
      containerStyle={[styles.container, containerStyle]}
      iconStyle={[iconStyle]}
      source={source}
      color={color}
      activeColor={activeColor}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {right: 15},
});

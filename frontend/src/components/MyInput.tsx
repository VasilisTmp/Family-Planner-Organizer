import {
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

interface Props {
  text?: string;
  onPress?: Function;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function MyInput({
  text,
  onPress = () => null,
  containerStyle,
  textStyle,
  disabled = false,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      style={({pressed}) => [
        styles.container,
        {borderColor: pressed ? colors.details : colors.text},
        containerStyle,
      ]}
      onPress={() => setTimeout(() => onPress(), 0)}>
      <Text style={[globalStyles.text, styles.text, textStyle]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
    width: 124,
    borderRadius: 25,
  },
  text: {fontSize: 18},
});

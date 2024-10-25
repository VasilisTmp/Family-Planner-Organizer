import {
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  Text,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  containerStyle2?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  onPress?: Function;
  onLongPress?: Function;
  source?: ImageSourcePropType;
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  color?: string;
  rippleColor?: string;
  disabled?: boolean;
}

export function OptionWithIcon({
  containerStyle2,
  containerStyle,
  iconStyle,
  onPress = () => null,
  source = require('../assets/settingsIcon.png'),
  text,
  textStyle,
  onLongPress = () => null,
  children,
  color = colors.primary,
  rippleColor = colors.ripple,
  disabled,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        style={[styles.container2, {backgroundColor: color}, containerStyle2]}
        disabled={disabled}
        onPress={() =>
          setTimeout(() => {
            onPress();
          }, 50)
        }
        onLongPress={() => onLongPress()}
        unstable_pressDelay={70}
        delayLongPress={colors.delay}
        android_ripple={{color: rippleColor}}>
        <Image style={[styles.icon, iconStyle]} source={source} />
        {text && (
          <Text style={[globalStyles.text, styles.text, {left: 15}, textStyle]}>
            {text}
          </Text>
        )}
        {children}
      </Pressable>
    </View>
  );
}

export function Option({
  containerStyle2,
  containerStyle,
  onPress = () => null,
  text,
  textStyle,
  onLongPress = () => null,
  children,
  color = colors.primary,
  rippleColor = colors.ripple,
  disabled,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        style={[styles.container2, {backgroundColor: color}, containerStyle2]}
        disabled={disabled}
        onPress={() =>
          setTimeout(() => {
            onPress();
          }, 50)
        }
        onLongPress={() => onLongPress()}
        unstable_pressDelay={70}
        delayLongPress={colors.delay}
        android_ripple={{color: rippleColor}}>
        {text && (
          <Text style={[globalStyles.text, styles.text, textStyle]}>
            {text}
          </Text>
        )}
        {children}
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  text: {fontSize: 20},
  icon: {tintColor: colors.text, width: 23, height: 23},
  container: {overflow: 'hidden'},
  container2: {flexDirection: 'row', padding: 15, alignItems: 'center'},
});

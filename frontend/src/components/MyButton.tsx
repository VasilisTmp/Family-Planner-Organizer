import {
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  StyleProp,
  Text,
} from 'react-native';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  onPress?: Function;
  source?: ImageSourcePropType;
  activeColor?: string;
  color?: string;
  dimensions?: number;
  text?: string;
}

export default function MyButton({
  containerStyle,
  iconStyle,
  onPress = () => null,
  source,
  activeColor = colors.tertiary,
  color = colors.background,
  dimensions = 22,
  text,
}: Props) {
  return (
    <Pressable
      unstable_pressDelay={70}
      onPress={() => setTimeout(() => onPress(), 0)}
      style={({pressed}) => [
        {
          backgroundColor: pressed ? activeColor : color,
        },
        styles.container,
        containerStyle,
      ]}>
      {source && (
        <Image
          style={[
            {width: dimensions, height: dimensions},
            styles.icon,
            iconStyle,
          ]}
          source={source}
        />
      )}
      {text && (
        <Text
          style={[
            globalStyles.text,
            {fontSize: 20, bottom: 2.5, fontWeight: '500'},
          ]}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {tintColor: colors.text},
});

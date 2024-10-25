import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';

import colors from '../config/colors';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function OptionsBar({children, style}: Props) {
  return <View style={[styles.container, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  container: {
    height: 53,
    borderBottomColor: colors.tertiary,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
});

import {
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ViewProps,
} from 'react-native';

import colors from '../config/colors';

export function Background({...props}: ViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        {...props}
        style={[
          {backgroundColor: colors.background, flex: 1, width: '100%'},
          props.style,
        ]}
      />
    </TouchableWithoutFeedback>
  );
}

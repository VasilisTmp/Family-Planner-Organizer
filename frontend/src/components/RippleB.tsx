import React from 'react';
import {
  Text,
  ViewStyle,
  TextStyle,
  Pressable,
  StyleProp,
  View,
} from 'react-native';
import _ from 'lodash';

import colors from '../config/colors';
import globalStyles from '../config/globalStyles';

interface Props {
  style?: StyleProp<ViewStyle>;
  style2?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  text?: string;
  onPress?: Function;
  color?: string;
  rippleColor?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function RippleB({
  style,
  style2,
  textStyle,
  text = 'RippleB',
  onPress = () => null,
  color = colors.secondary,
  rippleColor = colors.ripple,
  children,
  disabled,
}: Props) {
  return (
    <View style={[{borderRadius: 3, overflow: 'hidden'}, style]}>
      <Pressable
        disabled={disabled}
        style={[
          {
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            padding: 10,
          },
          style2,
        ]}
        unstable_pressDelay={70}
        android_ripple={{color: rippleColor}}
        onPress={_.throttle(
          () => {
            setTimeout(() => onPress(), 50);
          },
          1500,
          {trailing: false},
        )}>
        {text && (
          <Text
            style={[
              globalStyles.text,
              {fontSize: 18, fontWeight: '400'},
              textStyle,
            ]}>
            {text}
          </Text>
        )}
        {children}
      </Pressable>
    </View>
  );
}

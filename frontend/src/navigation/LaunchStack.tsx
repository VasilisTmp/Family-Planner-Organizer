import {
  createNativeStackNavigator,
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {View} from 'react-native';

import {useMyStore} from '../../store';
import colors from '../config/colors';

import {
  ChangeUsernameScreen,
  CreateGroupScreen,
  GroupScreen,
  IdScreen,
  JoinGroupScreen,
  LaunchScreen,
  AccountSettingsScreen,
  SignInScreen,
  SignUpScreen,
} from '../screens';

export type LaunchStackParamList = {
  LaunchScreen: undefined;
  SignUpScreen: undefined;
  SignInScreen: undefined;
  GroupScreen: undefined;
  JoinGroupScreen: undefined;
  CreateGroupScreen: undefined;
  AccountSettingsScreen: undefined;
  ChangeUsernameScreen: undefined;
  IdScreen: undefined;
};

export type LaunchScreenProps = NativeStackScreenProps<
  LaunchStackParamList,
  'LaunchScreen'
>;
export type SignUpScreenProps = NativeStackScreenProps<
  LaunchStackParamList,
  'SignUpScreen'
>;
export type SignInScreenProps = NativeStackScreenProps<
  LaunchStackParamList,
  'SignInScreen'
>;
export type GroupScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'GroupScreen'
>;
export type JoinGroupScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'JoinGroupScreen'
>;
export type CreateGroupScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'CreateGroupScreen'
>;
export type AccountSettingsScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'AccountSettingsScreen'
>;
export type ChangeUsernameScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'ChangeUsernameScreen'
>;
export type IdScreenPropsLaunchStack = NativeStackNavigationProp<
  LaunchStackParamList,
  'IdScreen'
>;

const Stack = createNativeStackNavigator<LaunchStackParamList>();
//////////////////////////////////////////////////////////////////////////////
export default function LaunchStack() {
  const {userId} = useMyStore();
  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <Stack.Navigator
        screenOptions={{animation: 'fade', headerShown: false}}
        initialRouteName={userId ? 'GroupScreen' : 'LaunchScreen'}>
        <Stack.Screen name="LaunchScreen" component={LaunchScreen} />
        <Stack.Screen name="GroupScreen" component={GroupScreen} />
        <Stack.Screen
          name="AccountSettingsScreen"
          component={AccountSettingsScreen}
        />
        <Stack.Screen
          name="ChangeUsernameScreen"
          component={ChangeUsernameScreen}
        />
        <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen name="JoinGroupScreen" component={JoinGroupScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="IdScreen" component={IdScreen} />
      </Stack.Navigator>
    </View>
  );
}

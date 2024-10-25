import {
  createNativeStackNavigator,
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {View} from 'react-native';

import colors from '../config/colors';
import {
  BirthdatesScreen,
  AddMemberScreen,
  ChangeColorScreen,
  ChangeNicknameScreen,
  ChangeUsernameScreen,
  CreateGroupScreen,
  GroupScreen,
  HomeScreen,
  IdScreen,
  JoinGroupScreen,
  AccountSettingsScreen,
  ManageMembersScreen,
  NotesScreen,
  SettingsScreen,
} from '../screens';
import {scrollViewRef} from '../screens/HomeScreen';
import {HomeStackProps} from './Tabs';

type HomeStackParamList = {
  ChangeNicknameScreen: undefined;
  ChangeUsernameScreen: undefined;
  NotesScreen: undefined;
  ChangeColorScreen: undefined;
  ManageMembersScreen: undefined;
  AddMemberScreen: undefined;
  GroupScreen: undefined;
  CreateGroupScreen: undefined;
  SettingsScreen: undefined;
  JoinGroupScreen: undefined;
  HomeScreen: undefined;
  AccountSettingsScreen: undefined;
  BirthdatesScreen: undefined;
  IdScreen: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export type ChangeNicknameScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ChangeNicknameScreen'
>;
export type ChangeUsernameScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'ChangeUsernameScreen'
>;
export type NotesScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'NotesScreen'
>;
export type ChangeColorScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ChangeColorScreen'
>;
export type ManageMembersScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ManageMembersScreen'
>;
export type AddMemberScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddMemberScreen'
>;
export type GroupScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'GroupScreen'
>;
export type CreateGroupScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'CreateGroupScreen'
>;
export type SettingsScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'SettingsScreen'
>;
export type BirthdatesScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'BirthdatesScreen'
>;
export type JoinGroupScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'JoinGroupScreen'
>;
export type AccountSettingsScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'AccountSettingsScreen'
>;
export type IdScreenPropsHomeStack = NativeStackNavigationProp<
  HomeStackParamList,
  'IdScreen'
>;
export type HomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'HomeScreen'
>;
//////////////////////////////////////////////////////////////////////////////////
export default function HomeStack({navigation}: HomeStackProps) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e: any) => {
      scrollViewRef.current?.scrollToLocation({
        animated: true,
        sectionIndex: 0,
        itemIndex: 1,
      });
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <Stack.Navigator
        screenOptions={{animation: 'fade', headerShown: false}}
        initialRouteName="HomeScreen">
        <Stack.Screen
          name="ChangeNicknameScreen"
          component={ChangeNicknameScreen}
        />
        <Stack.Screen
          name="ChangeUsernameScreen"
          component={ChangeUsernameScreen}
        />
        <Stack.Screen name="NotesScreen" component={NotesScreen} />
        <Stack.Screen name="ChangeColorScreen" component={ChangeColorScreen} />
        <Stack.Screen
          name="ManageMembersScreen"
          component={ManageMembersScreen}
        />
        <Stack.Screen name="AddMemberScreen" component={AddMemberScreen} />
        <Stack.Screen name="GroupScreen" component={GroupScreen} />
        <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="BirthdatesScreen" component={BirthdatesScreen} />
        <Stack.Screen name="JoinGroupScreen" component={JoinGroupScreen} />
        <Stack.Screen
          name="AccountSettingsScreen"
          component={AccountSettingsScreen}
        />
        <Stack.Screen name="IdScreen" component={IdScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </View>
  );
}

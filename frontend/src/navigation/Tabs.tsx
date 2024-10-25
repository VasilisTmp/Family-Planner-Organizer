import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from '@react-navigation/material-top-tabs';
import {
  Image,
  StyleSheet,
  ImageSourcePropType,
  Keyboard,
  View,
  Text,
} from 'react-native';
import {useEffect, useState} from 'react';

import colors from '../config/colors';
import {
  PhotosScreen,
  CalendarScreen,
  ChatScreen,
  MealsScreen,
} from '../screens';
import HomeStack from './HomeStack';
import {useMyStore} from '../../store';

export type TabsParamList = {
  HomeStack: undefined;
  ChatScreen: undefined;
  MealsScreen: undefined;
  PhotosScreen: undefined;
  CalendarScreen: undefined;
};

const Tab = createMaterialTopTabNavigator<TabsParamList>();

interface Props {
  source: ImageSourcePropType;
  tintColor: string;
}

const TabIcon = ({source, tintColor}: Props) => (
  <Image style={[{tintColor: tintColor}, styles.icon]} source={source} />
);
const TabChatIcon = ({source, tintColor}: Props) => {
  const {unread, chatFocused} = useMyStore();

  /////////////////////////////////////////////////////////////////////////////
  return (
    <>
      {!chatFocused && !!unread && (
        <View
          style={{
            width: unread < 100 ? 15 : 20,
            height: 14,
            borderRadius: 100,
            backgroundColor: 'red',
            position: 'absolute',
            right: unread < 100 ? -11 : -16,
            top: -10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 10, color: colors.text}}>
            {unread < 100 ? unread : '99+'}
          </Text>
        </View>
      )}
      <Image style={[{tintColor: tintColor}, styles.icon]} source={source} />
    </>
  );
};

export type HomeStackProps = MaterialTopTabScreenProps<
  TabsParamList,
  'HomeStack'
>;
/////////////////////////////////////////////////////////////////////////////
export default function Tabs() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setVis(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setVis(false),
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      backBehavior="initialRoute"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.bar,
          {height: vis ? 0 : 'auto', borderTopWidth: vis ? 0 : 1},
        ],
        tabBarIndicatorStyle: {
          backgroundColor: colors.details,
          height: vis ? 0 : 1,
        },
        tabBarActiveTintColor: colors.details,
        tabBarInactiveTintColor: colors.text,
        tabBarAndroidRipple: {radius: 0},
      }}>
      <Tab.Screen
        options={{
          tabBarIcon: ({color}) => (
            <TabIcon
              tintColor={color}
              source={require('../assets/mealsIcon.png')}
            />
          ),
        }}
        name="MealsScreen"
        component={MealsScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color}) => (
            <TabIcon
              tintColor={color}
              source={require('../assets/calendarIcon.png')}
            />
          ),
        }}
        name="CalendarScreen"
        component={CalendarScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color}) => (
            <TabIcon
              tintColor={color}
              source={require('../assets/homeIcon.png')}
            />
          ),
        }}
        name="HomeStack"
        component={HomeStack}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color}) => (
            <TabChatIcon
              tintColor={color}
              source={require('../assets/chatIcon.png')}
            />
          ),
        }}
        name="ChatScreen"
        component={ChatScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({color}) => (
            <TabIcon
              tintColor={color}
              source={require('../assets/albumIcon.png')}
            />
          ),
        }}
        name="PhotosScreen"
        component={PhotosScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {width: 23, height: 23},
  bar: {borderTopColor: colors.tertiary, backgroundColor: colors.background},
});

import {StatusBar} from 'react-native';
import {ToastProvider} from 'react-native-toast-notifications';
import {Auth0Provider} from 'react-native-auth0';
import notifee from '@notifee/react-native';
import {PermissionsAndroid} from 'react-native';
import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  RequestDisableOptimization,
  BatteryOptEnabled,
} from 'react-native-battery-optimization-check';

import colors from './src/config/colors';
import Wtf from './src/navigation/Wtf';
import {useMyStore} from './store';
import {LoadingModal} from './src/components';
import {AUTH0_CLIENTID, AUTH0_DOMAIN} from '@env';
import {SocketHandler} from './src/utils';

const notificationChannels = async () => {
  await notifee.createChannel({
    id: '1',
    name: 'vibe yes',
    importance: 4,
    vibration: true,
    sound: 'default',
  });
  await notifee.createChannel({
    id: '2',
    name: 'vibe no',
    importance: 4,
    vibration: false,
    sound: 'default',
  });
};

export default function App() {
  const {
    items,
    meals,
    notes,
    photos,
    albums,
    events,
    members,
    groupAdminId,
    groups,
    userId,
    chatFocused,
    messages,
  } = useMyStore();

  notifee.onBackgroundEvent(async () => {});

  useEffect(() => {
    (async () => {
      await notificationChannels();
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      BatteryOptEnabled().then((isEnabled: any) => {
        isEnabled && RequestDisableOptimization();
      });
    })();
  }, []);

  const wtf = SocketHandler();

  useEffect(() => {
    const unsub = messaging().setBackgroundMessageHandler(
      async remoteMessage => {
        // console.log('kys2');
        await wtf(remoteMessage.data, false, true);
      },
    );
    return unsub;
  }, [
    items,
    meals,
    notes,
    photos,
    albums,
    events,
    members,
    groupAdminId,
    groups,
    userId,
    messages,
  ]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // console.log('kys1');
      await wtf(remoteMessage.data, chatFocused, false);
    });
    return unsubscribe;
  }, [
    items,
    meals,
    notes,
    photos,
    albums,
    events,
    members,
    groupAdminId,
    groups,
    userId,
    messages,
    chatFocused,
  ]);

  ///////////////////////////////////////////////////////////////////////
  return (
    <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENTID}>
      <ToastProvider
        style={{width: 250, justifyContent: 'center'}}
        warningColor={colors.warning}
        successColor={colors.success}
        dangerColor={colors.danger}
        placement="top"
        duration={3000}
        textStyle={{fontSize: 18, fontWeight: 'normal', textAlign: 'center'}}
        swipeEnabled
        offsetTop={40}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle="light-content"
        />
        <LoadingModal />
        <Wtf />
      </ToastProvider>
    </Auth0Provider>
  );
}

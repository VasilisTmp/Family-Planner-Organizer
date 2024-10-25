/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import notifee from '@notifee/react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import jwtDecode from 'jwt-decode';

import App from './App';
import {name as appName} from './app.json';
import {EventsNotificationsBackground} from './src/components';

notifee.onBackgroundEvent(async ({detail}) => {
  // notifee.displayNotification(detail.notification);
});

const messageNotification = async message => {
  const {newMessage, nickname} = message;
  const {text, date} = newMessage;
  const notification = {
    title: 'Message',
    subtitle: `${moment(date).format('HH:mm')}`,
    body: `${nickname}: ${text}`,
    android: {
      channelId: '1',
      pressAction: {
        id: 'default',
      },
    },
  };
  await notifee.displayNotification(notification);
};

const eventNotification = async eventStateChange => {
  const {event, nickname, forNickname} = eventStateChange;
  const {title, timeFrom, date, timeTo, done} = event;
  const notification = {
    title: `${title}`,
    subtitle: `${forNickname ? forNickname + ' \u2022' : ''}
     ${timeFrom ? timeFrom : ''}${timeTo ? '-' + timeTo + ' \u2022 ' : ''}${
       timeFrom && !timeTo ? ' \u2022 ' : ''
     }${moment(date).format('DD-MM-YYYY')}`,
    body: `${nickname}: ${done ? 'Completed' : 'Incomplete'}`,
    android: {
      color: `${done ? '#007f00' : '#a00000'}`,
      channelId: '1',
      pressAction: {
        id: 'default',
      },
    },
  };
  await notifee.displayNotification(notification);
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  let decoded = '';
  let userId = '';
  const idToken = (await EncryptedStorage.getItem('idToken')) || '';
  if (idToken) {
    decoded = jwtDecode(idToken);
    userId = decoded.sub.split('|')[1];
  }
  const {type, dataa} = remoteMessage.data;
  const dt = JSON.parse(dataa);
  switch (type) {
    case 'newmessageIN':
      dt.userId !== userId && (await messageNotification(dt));
      break;
    case 'doneeventIN':
      dt.userIdChange !== userId && (await eventNotification(dt));
      break;
    case 'deleteeventIN':
    case 'neweventIN':
    case 'updateeventIN':
      await EventsNotificationsBackground(remoteMessage.data, userId);
      break;
    default:
      break;
  }
});

AppRegistry.registerComponent(appName, () => App);

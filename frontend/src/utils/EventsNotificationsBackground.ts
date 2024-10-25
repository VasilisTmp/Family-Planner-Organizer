import moment from 'moment';
import notifee, {TimestampTrigger, TriggerType} from '@notifee/react-native';

import {weekDays} from '../config/fake data';

export default async function EventsNotificationsBackground(
  message: any,
  userId: string,
) {
  const {type, dataa} = message;
  const dt = JSON.parse(dataa);
  let e = dt.event;
  const today = moment();
  if (type === 'deleteeventIN') {
    notifee.cancelNotification(e);
    notifee.cancelNotification(e.concat('24'));
    notifee.cancelNotification(e.concat('3'));
  } else if (type === 'neweventIN' || type === 'updateeventIN') {
    if (
      e.notifications &&
      !e.todo &&
      e.timeFrom &&
      (e.forId === userId || !e.forId)
    ) {
      if (e.repeat) {
        const next = moment(e.date);
        e.everyType === 'w' && next.day(weekDays.indexOf(e.on));
        e.everyType === 'm' && next.date(Number(e.on));
        if (next.isBefore(moment(e.date), 'day')) {
          e.everyType === 'w' && next.add(1, 'weeks');
          e.everyType === 'm' && next.add(1, 'months');
        }
        const add = e.every;
        while (true) {
          if (next.isSameOrAfter(today, 'day')) break;
          e.everyType === 'd' && next.add(add, 'days');
          e.everyType === 'w' && next.add(add, 'weeks');
          e.everyType === 'm' && next.add(add, 'months');
        }
        e = {...e, date: next.format('YYYY-MM-DD')};
      }
    } else {
      notifee.cancelNotification(e._id);
      notifee.cancelNotification(e._id.concat('24'));
      notifee.cancelNotification(e._id.concat('3'));
      return;
    }
    const hours = Number(e.timeFrom.split(':')[0]);
    const mins = Number(e.timeFrom.split(':')[1]);
    const next = moment(e.date).set({
      hour: hours,
      minute: mins,
    });
    const now = moment();
    if (next.isAfter(now)) {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: next.toDate().getTime(),
        alarmManager: {
          allowWhileIdle: true,
        },
      };
      const body = e.timeTo ? e.timeFrom.concat(' - ', e.timeTo) : e.timeFrom;
      await notifee.createTriggerNotification(
        {
          id: e._id,
          title: e.title,
          body: body,
          android: {
            channelId: '1',
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );
      const nextBefore24 = next.clone().subtract(1, 'days');
      if (nextBefore24.isAfter(now)) {
        const trigger24: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: nextBefore24.toDate().getTime(),
          alarmManager: {
            allowWhileIdle: true,
          },
        };
        await notifee.createTriggerNotification(
          {
            id: e._id.concat('24'),
            title: e.title,
            body: body,
            android: {
              channelId: '1',
              pressAction: {
                id: 'default',
              },
            },
          },
          trigger24,
        );
      }
      const nextBefore3 = next.clone().subtract(3, 'hours');
      if (nextBefore3.isAfter(now)) {
        const trigger3: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: nextBefore3.toDate().getTime(),
          alarmManager: {
            allowWhileIdle: true,
          },
        };
        await notifee.createTriggerNotification(
          {
            id: e._id.concat('3'),
            title: e.title,
            body: body,
            android: {
              channelId: '1',
              pressAction: {
                id: 'default',
              },
            },
          },
          trigger3,
        );
      }
    }
  }
}

import {useEffect} from 'react';
import moment from 'moment';
import notifee, {TimestampTrigger, TriggerType} from '@notifee/react-native';

import {useMyStore} from '../../store';
import {groupEventsType} from '../config/types';
import {emptyEvent, weekDays} from '../config/fake data';

export default function EventsNotifications() {
  const max = 20;
  const {events, members, userId} = useMyStore();
  const upcoming = [] as groupEventsType[];
  const today = moment();
  if (events.length) {
    events.forEach(e => {
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
          const ev = {...e, date: next.format('YYYY-MM-DD')};
          upcoming.push(ev);
        } else {
          upcoming.push(e);
        }
      }
    });
  }
  members.forEach(m => {
    if (m.birthdate) {
      const ev = {
        ...emptyEvent,
        _id: `birthday${m.userId}`,
        title: `It's ${m.nickname}'s birthday !`,
        date: moment(m.birthdate).year(today.year()).format('YYYY-MM-DD'),
        timeFrom: '00:00',
      };
      upcoming.push(ev);
    } else {
      notifee.cancelNotification(`birthday${m.userId}`);
      notifee.cancelNotification(`birthday${m.userId}9`);
      notifee.cancelNotification(`birthday${m.userId}21`);
    }
  });
  if (upcoming.length) {
    upcoming.sort((a, b) => {
      const dA = moment(a.date);
      const dB = moment(b.date);
      if (dA.isAfter(dB, 'day')) {
        return 1;
      } else if (dA.isBefore(dB, 'day')) {
        return -1;
      } else {
        const tA = moment(a.timeFrom, 'HH:mm');
        const tB = moment(b.timeFrom, 'HH:mm');
        return tA.isAfter(tB) ? 1 : tA.isBefore(tB) ? -1 : 0;
      }
    });
  }
  useEffect(() => {
    notifee.cancelAllNotifications();
  }, []);
  useEffect(() => {
    (async () => {
      let counter = 0;
      const length = upcoming.length;
      for (let i = 0; i < length; i++) {
        const e = upcoming[i];
        const hours = Number(e.timeFrom.split(':')[0]);
        const mins = Number(e.timeFrom.split(':')[1]);
        const next = moment(e.date).set({
          hour: hours,
          minute: mins,
        });
        const now = moment();
        if (e._id.includes('birthday') && next.isBefore(now, 'day')) continue;
        if (next.isAfter(now) || e._id.includes('birthday')) {
          const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: next.toDate().getTime(),
            alarmManager: {
              allowWhileIdle: true,
            },
          };
          const body = e.timeTo
            ? e.timeFrom.concat(' - ', e.timeTo)
            : e.timeFrom;
          next.isAfter(now) &&
            (await notifee.createTriggerNotification(
              {
                id: e._id,
                title: e.title,
                body: e._id.includes('birthday') ? '' : body,
                android: {
                  channelId: '1',
                  pressAction: {
                    id: 'default',
                  },
                },
              },
              trigger,
            ));
          if (e._id.includes('birthday')) {
            const nextAfter9 = next.clone().add(9, 'hours');
            if (nextAfter9.isAfter(now)) {
              const trigger9: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: nextAfter9.toDate().getTime(),
                alarmManager: {
                  allowWhileIdle: true,
                },
              };
              await notifee.createTriggerNotification(
                {
                  id: e._id.concat('9'),
                  title: e.title,
                  body: '',
                  android: {
                    channelId: '1',
                    pressAction: {
                      id: 'default',
                    },
                  },
                },
                trigger9,
              );
            }
            const nextAfter21 = next.clone().add(21, 'hours');
            if (nextAfter9.isAfter(now)) {
              const trigger21: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: nextAfter21.toDate().getTime(),
                alarmManager: {
                  allowWhileIdle: true,
                },
              };
              await notifee.createTriggerNotification(
                {
                  id: e._id.concat('21'),
                  title: e.title,
                  body: '',
                  android: {
                    channelId: '1',
                    pressAction: {
                      id: 'default',
                    },
                  },
                },
                trigger21,
              );
            }
            counter++;
            if (counter === max) {
              break;
            } else {
              continue;
            }
          }
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
          counter++;
          if (counter === max) break;
        }
      }
    })();
  }, [events, members]);
}

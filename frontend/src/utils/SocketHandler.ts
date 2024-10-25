import EncryptedStorage from 'react-native-encrypted-storage';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import moment from 'moment';

import {useMyStore} from '../../store';
import {groupMessagesType} from '../config/types';
import colors from '../config/colors';

export default function SocketHandler() {
  const {
    items,
    setItems,
    meals,
    setMeals,
    notes,
    setNotes,
    photos,
    setPhotos,
    albums,
    setAlbums,
    events,
    setEvents,
    members,
    setMembers,
    groupAdminId,
    setGroupAdminId,
    groups,
    setGroups,
    logOut,
    userId,
    setMessages,
    messages,
    setMsgReceived,
  } = useMyStore();

  //ITEMS/////////////////////////////////////////////////////////////
  const socketNewItemIN = (data: any) => {
    setItems([...items, data.item]);
  };

  const socketPurchasedItemsIN = (data: any) => {
    const selected = data.selected;
    const value = data.value;
    setItems(
      items.map(i => (selected.includes(i._id) ? {...i, purchased: value} : i)),
    );
  };

  const socketUpdateItemIN = (data: any) => {
    const item = data.item;
    let found = items.find(i => i._id === item._id);
    if (found) {
      found = Object.assign(found, item);
      setItems([...items]);
    }
  };

  const socketDeleteItemsIN = (data: any) => {
    const selected = data.selected;
    setItems(items.filter(i => !selected.includes(i._id)));
  };

  const socketDeletePurchasedItemsIN = (data: any) => {
    setItems(items.filter(item => item.purchased === false));
  };

  ///////////////////////////////////////////////////////////////////////////

  //MEALS//////////////////////////////////////////////////////////////////////

  const socketNewMealIN = (data: any) => {
    setMeals([...meals, data.meal]);
  };

  const socketDeleteDayMealsIN = (data: any) => {
    const day = data.day;
    setMeals(meals.filter(m => m.day !== day));
  };

  const socketDeleteMealsIN = (data: any) => {
    const selected = data.selected;
    setMeals(meals.filter(m => !selected.includes(m._id)));
  };

  const socketUpdateMealIN = (data: any) => {
    const meal = data.meal;
    let found = meals.find(m => m._id === meal._id);
    if (found) {
      found = Object.assign(found, meal);
      setMeals([...meals]);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////

  //NOTES///////////////////////////////////////////////////////////////////////
  const socketPinnedNotesIN = (data: any) => {
    const selected = data.selected;
    const value = data.value;
    setNotes(
      notes.map(n => (selected.includes(n._id) ? {...n, pinned: value} : n)),
    );
  };

  const socketDeleteNotesIN = (data: any) => {
    const selected = data.selected;
    setNotes(notes.filter(n => !selected.includes(n._id)));
  };

  const socketNewNoteIN = (data: any) => {
    const note = data.note;
    setNotes([...notes, note]);
  };

  const socketUpdateNoteIN = (data: any) => {
    const note = data.note;
    let found = notes.find(n => n._id === note._id);
    if (found) {
      found = Object.assign(found, note);
      setNotes([...notes]);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////

  //PHOTOS/////////////////////////////////////////////////////////////////////
  const socketNewPhotosIN = (data: any) => {
    const photos = data.photos;
    setPhotos(photos);
  };

  const socketDeletePhotosIN = (data: any) => {
    const selected = data.selected;
    setPhotos(photos.filter(p => !selected.includes(p._id)));
  };

  const socketRenameAlbumIN = (data: any) => {
    const album = data.album;
    const value = data.value;
    setPhotos(photos.map(p => (p.album === album ? {...p, album: value} : p)));
    const found = albums.find(a => a.name === album);
    if (found) {
      found.name = value;
      setAlbums([...albums]);
    }
  };

  const socketNewAlbumIN = (data: any) => {
    const album = data.album;
    setAlbums([...albums, album]);
  };

  const socketDeleteAlbumIN = (data: any) => {
    const album = data.album;
    setPhotos(photos.filter(p => p.album !== album));
    setAlbums(albums.filter(a => a.name !== album));
  };

  const socketMovePhotosIN = (data: any) => {
    const selected = data.selected;
    const album = data.album;
    setPhotos(
      photos.map(p => (selected.includes(p._id) ? {...p, album: album} : p)),
    );
  };

  ///////////////////////////////////////////////////////////////////////////////

  //EVENTS////////////////////////////////////////////////////////////////////////
  const socketDeleteEventIN = (data: any) => {
    const event = data.event;
    setEvents(events.filter(e => e._id !== event));
    notifee.cancelNotification(event);
    notifee.cancelNotification(event.concat('24'));
    notifee.cancelNotification(event.concat('3'));
  };

  const socketDoneEventIN = (data: any) => {
    const event = data.event;
    let found = events.find(e => e._id === event._id);
    if (found) {
      found = Object.assign(found, event);
      setEvents([...events]);
    }
  };

  const socketNewEventIN = (data: any) => {
    const event = data.event;
    setEvents([...events, event]);
  };

  const socketUpdateEventIN = (data: any) => {
    const event = data.event;
    let found = events.find(e => e._id === event._id);
    if (found) {
      if (found.notifications && !event.notifications) {
        notifee.cancelNotification(event._id);
        notifee.cancelNotification(event._id.concat('24'));
        notifee.cancelNotification(event._id.concat('3'));
      }
      found = Object.assign(found, event);
      setEvents([...events]);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////

  //MEMBERS////////////////////////////////////////////////////////////////////
  const socketUpdateMemberIN = (data: any) => {
    const member = data.member;
    let found = members.find(m => m.userId === member.userId);
    if (found) {
      found = Object.assign(found, member);
      setMembers([...members]);
    }
  };

  const socketUpdateBirthdateIN = (data: any) => {
    const member = data.member;
    const birthdate = data.birthdate;
    const found = members.find(m => m.userId === member);
    if (found) {
      found.birthdate = birthdate;
      setMembers([...members]);
    }
  };

  const socketUpdateUsernameIN = (data: any) => {
    const member = data.member;
    const value = data.value;
    const found = members.find(m => m.userId === member);
    if (found) {
      if (found.originalname) {
        found.nickname = value;
        setMembers([...members]);
      } else if (found.nickname === value) {
        found.originalname = true;
        setMembers([...members]);
      }
    }
  };

  const socketNewMemberIN = (data: any) => {
    const member = data;
    setMembers([...members, member]);
  };

  const socketUpdateAdminIN = (data: any) => {
    const member = data.member;
    setGroupAdminId(member);
  };

  const socketNewGroupIN = (data: any) => {
    const group = data;
    setGroups([...groups, group]);
  };

  const socketRemoveMemberIN = async (data: any) => {
    const member = data.member;
    const groupId = data.groupId;
    if (member !== userId) {
      setMembers(members.filter(m => m.userId !== member));
      events.forEach(e => {
        if (
          e.userId === member &&
          e.notifications &&
          (e.forId === userId || !e.forId)
        ) {
          if (e.notifications) {
            notifee.cancelNotification(e._id);
            notifee.cancelNotification(e._id.concat('24'));
            notifee.cancelNotification(e._id.concat('3'));
          }
        }
      });
      notifee.cancelNotification(`birthday${member}`);
      notifee.cancelNotification(`birthday${member}9`);
      notifee.cancelNotification(`birthday${member}21`);
      setEvents(events.filter(e => e.userId !== member));
      setItems(items.filter(e => e.userId !== member));
      setMeals(meals.filter(e => e.userId !== member));
      setNotes(notes.filter(e => e.userId !== member));
      setPhotos(
        photos.map(p =>
          p.userId === member ? {...p, userId: groupAdminId} : p,
        ),
      );
      setAlbums(
        albums.map(p =>
          p.userId === member ? {...p, userId: groupAdminId} : p,
        ),
      );
    } else {
      await messaging().unsubscribeFromTopic(groupId);
      await EncryptedStorage.setItem('groupId', '');
      logOut();
    }
  };

  const socketRemoveGroupIN = (data: any) => {
    const groupId = data.groupId;
    setGroups(groups.filter(g => g._id !== groupId));
  };

  const socketRemoveMembersIN = async (data: any) => {
    const groupId = data.groupId;
    const memberss = data.members;
    if (memberss.includes(userId)) {
      await messaging().unsubscribeFromTopic(groupId);
      await EncryptedStorage.setItem('groupId', '');
      logOut();
    } else {
      setMembers(members.filter(m => m.userId === userId));
      events.forEach(e => {
        if (
          e.userId !== userId &&
          e.notifications &&
          (e.forId === userId || !e.forId)
        ) {
          if (e.notifications) {
            notifee.cancelNotification(e._id);
            notifee.cancelNotification(e._id.concat('24'));
            notifee.cancelNotification(e._id.concat('3'));
          }
        }
      });
      memberss.forEach((m: any) => {
        notifee.cancelNotification(`birthday${m}`);
        notifee.cancelNotification(`birthday${m}9`);
        notifee.cancelNotification(`birthday${m}21`);
      });
      setEvents(events.filter(e => e.userId === userId));
      setItems(items.filter(e => e.userId === userId));
      setMeals(meals.filter(e => e.userId === userId));
      setNotes(notes.filter(e => e.userId === userId));
      setPhotos(
        photos.map(p =>
          p.userId !== groupAdminId ? {...p, userId: groupAdminId} : p,
        ),
      );
      setAlbums(
        albums.map(p =>
          p.userId !== groupAdminId ? {...p, userId: groupAdminId} : p,
        ),
      );
    }
  };

  const socketDiavastikeIN = (data: any) => {
    const {member} = data;
    const found = members.find(m => m.userId === member);
    const temp = [...messages];
    const newRead = temp.reverse().find(t => t.userId !== member);
    if (found && newRead && newRead._id !== found.lastRead) {
      found.lastRead = newRead._id;
      setMembers([...members]);
    }
  };

  const socketNewMessageIN = (data: groupMessagesType) => {
    setMessages([...messages, data]);
    setMsgReceived(true);
    const member = members.find(m => m.userId === data.userId);
    if (member) {
      member.lastRead = data._id;
      setMembers([...members]);
    }
  };

  const messageNotification = async (
    message: {newMessage: groupMessagesType; nickname: string},
    focused: boolean,
    background: boolean,
  ) => {
    const {newMessage, nickname} = message;
    const {text, date} = newMessage;
    const notification = {
      title: 'Message',
      subtitle: `${moment(date).format('HH:mm')}`,
      body: `${nickname}: ${text}`,
      android: {
        channelId: background ? '1' : '2',
        pressAction: {
          id: 'default',
        },
      },
    };
    !focused && (await notifee.displayNotification(notification));
  };

  const eventNotification = async (data: any) => {
    const {event, nickname, forNickname} = data;
    const {title, timeFrom, date, timeTo, done} = event;
    const notification = {
      title: `${title}`,
      subtitle: `${forNickname ? forNickname + ' \u2022' : ''}
       ${timeFrom ? timeFrom : ''}${timeTo ? '-' + timeTo + ' \u2022 ' : ''}${
         timeFrom && !timeTo ? ' \u2022 ' : ''
       }${moment(date).format('DD-MM-YYYY')}`,
      body: `${nickname}: ${done ? 'Completed' : 'Incomplete'}`,
      android: {
        color: `${done ? colors.success : colors.warning}`,
        channelId: '1',
        pressAction: {
          id: 'default',
        },
      },
    };
    await notifee.displayNotification(notification);
  };

  async function Handle(data: any, focused: boolean, background: boolean) {
    const {type, dataa} = data;
    const dt = JSON.parse(dataa);
    switch (type) {
      case 'newitemIN':
        socketNewItemIN(dt);
        break;
      case 'purchaseditemsIN':
        socketPurchasedItemsIN(dt);
        break;
      case 'updateitemIN':
        socketUpdateItemIN(dt);
        break;
      case 'deleteitemsIN':
        socketDeleteItemsIN(dt);
        break;
      case 'deletepurchaseditemsIN':
        socketDeletePurchasedItemsIN(dt);
        break;
      case 'deletedaymealsIN':
        socketDeleteDayMealsIN(dt);
        break;
      case 'deletemealsIN':
        socketDeleteMealsIN(dt);
        break;
      case 'newmealIN':
        socketNewMealIN(dt);
        break;
      case 'updatemealIN':
        socketUpdateMealIN(dt);
        break;
      case 'newnoteIN':
        socketNewNoteIN(dt);
        break;
      case 'updatenoteIN':
        socketUpdateNoteIN(dt);
        break;
      case 'deletenotesIN':
        socketDeleteNotesIN(dt);
        break;
      case 'pinnednotesIN':
        socketPinnedNotesIN(dt);
        break;
      case 'newphotosIN':
        socketNewPhotosIN(dt);
        break;
      case 'deletephotosIN':
        socketDeletePhotosIN(dt);
        break;
      case 'renamealbumIN':
        socketRenameAlbumIN(dt);
        break;
      case 'newalbumIN':
        socketNewAlbumIN(dt);
        break;
      case 'deletealbumIN':
        socketDeleteAlbumIN(dt);
        break;
      case 'movephotosIN':
        socketMovePhotosIN(dt);
        break;
      case 'deleteeventIN':
        socketDeleteEventIN(dt);
        break;
      case 'doneeventIN':
        socketDoneEventIN(dt);
        dt.userIdChange !== userId && (await eventNotification(dt));
        break;
      case 'neweventIN':
        socketNewEventIN(dt);
        break;
      case 'updateeventIN':
        socketUpdateEventIN(dt);
        break;
      case 'updatenicknameIN':
        socketUpdateMemberIN(dt);
        break;
      case 'updatecolorIN':
        socketUpdateMemberIN(dt);
        break;
      case 'updateusernameIN':
        socketUpdateUsernameIN(dt);
        break;
      case 'updatebirthdateIN':
        socketUpdateBirthdateIN(dt);
        break;
      case 'updateadminIN':
        socketUpdateAdminIN(dt);
        break;
      case 'newmemberIN':
        socketNewMemberIN(dt);
        break;
      case 'newgroupIN':
        socketNewGroupIN(dt);
        break;
      case 'removememberIN':
        socketRemoveMemberIN(dt);
        break;
      case 'removegroupIN':
        socketRemoveGroupIN(dt);
        break;
      case 'removemembersIN':
        socketRemoveMembersIN(dt);
        break;
      case 'diavastikeIN':
        socketDiavastikeIN(dt);
        break;
      case 'newmessageIN':
        socketNewMessageIN(dt.newMessage);
        dt.newMessage.userId !== userId &&
          (await messageNotification(dt, focused, background));
        break;
      default:
        // console.log('wpa ti paixtike edw');
        break;
    }
  }

  return Handle;

  ///////////////////////////////////////////////////////////////////////////////
}

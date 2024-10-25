import {create} from 'zustand';
import notifee from '@notifee/react-native';

import {
  groupAlbumsType,
  groupEventsType,
  groupItemsType,
  groupMealsType,
  groupMembersType,
  groupMessagesType,
  groupNotesType,
  groupPhotosType,
  userGroupsType,
} from './src/config/types';

interface GlobalStates {
  loggedIn: boolean;
  logIn: Function;
  logOut: Function;
  groupId: string;
  setGroupId: (to: string) => void;
  groupAdminId: string;
  setGroupAdminId: (to: string) => void;
  email: string;
  setEmail: (to: string) => void;
  userId: string;
  setUserId: (to: string) => void;
  username: string;
  setUsername: (to: string) => void;
  birthdate: string;
  setBirthdate: (to: string) => void;
  groupName: string;
  setGroupName: (to: string) => void;
  members: groupMembersType[];
  setMembers: (to: groupMembersType[]) => void;
  groups: userGroupsType[];
  setGroups: (to: userGroupsType[]) => void;
  items: groupItemsType[];
  setItems: (to: groupItemsType[]) => void;
  meals: groupMealsType[];
  setMeals: (to: groupMealsType[]) => void;
  albums: groupAlbumsType[];
  setAlbums: (to: groupAlbumsType[]) => void;
  photos: groupPhotosType[];
  setPhotos: (to: groupPhotosType[]) => void;
  reset: boolean;
  setReset: () => void;
  loading: boolean;
  toggleLoading: (to: boolean) => void;
  notes: groupNotesType[];
  setNotes: (to: groupNotesType[]) => void;
  events: groupEventsType[];
  setEvents: (to: groupEventsType[]) => void;
  messages: groupMessagesType[];
  setMessages: (to: groupMessagesType[]) => void;
  chatIndex: number;
  setChatIndex: (to: number) => void;
  unread: number;
  setUnread: (to: number) => void;
  chatFocused: boolean;
  setChatFocused: (to: boolean) => void;
  msgReceived: boolean;
  setMsgReceived: (to: boolean) => void;
  allMessages: number;
  setAllMessages: (to: number) => void;
}

export const useMyStore = create<GlobalStates>()((set, get) => ({
  loggedIn: false,
  logIn: () => {
    console.log('kysIN');
    set(state => ({loggedIn: true}));
  },
  logOut: () => {
    set(state => ({loggedIn: false}));
    set(state => ({groupId: ''}));
    set(state => ({groupAdminId: ''}));
    set(state => ({groupName: ''}));
    set(state => ({chatIndex: 0}));
    set(state => ({members: []}));
    set(state => ({items: []}));
    set(state => ({meals: []}));
    set(state => ({albums: []}));
    set(state => ({photos: []}));
    set(state => ({events: []}));
    set(state => ({notes: []}));
    set(state => ({messages: []}));
    notifee.cancelAllNotifications();
    console.log('kysOUT');
  },
  groupId: '',
  setGroupId: to => {
    set(state => ({groupId: to}));
    console.log('SETGroupId ' + get().groupId);
  },
  groupAdminId: '',
  setGroupAdminId: to => {
    set(state => ({groupAdminId: to}));
    console.log('SETGroupAdminId ' + get().groupAdminId);
  },
  email: '',
  setEmail: to => {
    set(state => ({email: to}));
    console.log('SETemail ' + get().email);
  },
  userId: '',
  setUserId: to => {
    set(state => ({userId: to}));
    console.log('SETuserId ' + get().userId);
  },
  username: '',
  setUsername: to => {
    set(state => ({username: to}));
    console.log('SETusername ' + get().username);
  },
  birthdate: '',
  setBirthdate: to => {
    set(state => ({birthdate: to}));
    console.log('SETbirthdate ' + get().birthdate);
  },
  groupName: '',
  setGroupName: to => {
    set(state => ({groupName: to}));
    console.log('SETgroupName ' + get().groupName);
  },
  members: [],
  setMembers: to => {
    set(state => ({members: to}));
    // console.log(get().members);
  },
  groups: [],
  setGroups: to => {
    set(state => ({groups: to}));
    // console.log(get().groups);
  },
  items: [],
  setItems: to => {
    set(state => ({items: to}));
    // console.log(get().items);
  },
  meals: [],
  setMeals: to => {
    set(state => ({meals: to}));
    // console.log(get().meals);
  },
  albums: [],
  setAlbums: to => {
    set(state => ({albums: to}));
    // console.log(get().albums);
  },
  photos: [],
  setPhotos: to => {
    set(state => ({photos: to}));
    // console.log(get().photos);
  },
  reset: false,
  setReset: () => {
    set(state => ({reset: !state.reset}));
    // console.log('reset');
  },
  loading: false,
  toggleLoading: to => {
    set(state => ({loading: to}));
    // console.trace(get().loading + '\n');
  },
  notes: [],
  setNotes: to => {
    set(state => ({notes: to}));
    // console.log(get().notes);
  },
  events: [],
  setEvents: to => {
    set(state => ({events: to}));
    // console.log(get().events);
  },
  messages: [],
  setMessages: to => {
    set(state => ({messages: to}));
    // console.log(get().messages);
  },
  chatIndex: 0,
  setChatIndex: to => {
    set(state => ({chatIndex: to}));
    // console.log(get().chatIndex);
  },
  unread: 0,
  setUnread: to => {
    set(state => ({unread: to}));
    // console.log(get().unread);
  },
  chatFocused: false,
  setChatFocused: to => {
    set(state => ({chatFocused: to}));
    // console.log(get().chatFocused);
  },
  msgReceived: false,
  setMsgReceived: to => {
    set(state => ({msgReceived: to}));
    // console.log(get().msgReceived);
  },
  allMessages: 0,
  setAllMessages: to => {
    set(state => ({allMessages: to}));
    // console.log(get().allMessages);
  },
}));

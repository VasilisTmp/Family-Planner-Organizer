import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

import {groupEventsType} from '../config/types';
import {API_URL} from './config';

async function getClient() {
  // const options = {
  //   httpsAgent: new https.Agent({
  //     ca: fs.readFileSync('/path/to/custom/cert.pem'),
  //   }),
  // };
  const accessToken = (await EncryptedStorage.getItem('accessToken')) || '';
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return client;
}

export const randomColor = () =>
  '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);

export async function _delMsgsGroup(id: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/delmsgs`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new group me admin-return new group
export async function _newGroup(
  name: string,
  adminId: string,
  members: {userId: string; nickname: string; color: string; birthdate: string},
) {
  const client = await getClient();
  const res = client
    .post(`/groups/newgroup`, {name, adminId, members})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get group
export async function _getGroup(id: string) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/getgroup`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//change adimn
export async function _changeAdminGroup(id: string, userId: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/changeadmin`, {userId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//disband group, remove group from users-return
export async function _deleteGroup(id: string) {
  const client = await getClient();
  const res = client
    .delete(`/groups/${id}/disbandgroup`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new member to group-return new member
export async function _addMemberGroup(id: string, userId: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/members/new`, {userId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get members of group
export async function _getMembersGroup(id: string) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/members/get`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove member from group-return group
export async function _deleteMemberGroup(id: string, userId: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/members/remove`, {userId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove all members from group-return group
export async function _deleteAllMembersGroup(id: string, userId: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/members/removeall`, {userId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update color of member-return updateMemmber
export async function _updateMemberColorGroup(
  id: string,
  userId: string,
  color: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/members/updatecolor`, {userId, color})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update nickname of member-return updateMemmber
export async function _updateMemberNicknameGroup(
  id: string,
  userId: string,
  name: string,
  username: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/members/updatenickname`, {userId, name, username})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new item to shopping list, return group
export async function _addItemGroup(
  id: string,
  userId: string,
  name: string,
  image: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/items/new`, {userId, name, image})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get items-return items
export async function _getItemsGroup(id: string) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/items/get`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove items from group-return group
export async function _deleteItemsGroup(id: string, ids: string[]) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/items/remove`, {ids})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove purchased items-return group
export async function _deletePurchasedItemsGroup(id: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/items/removepurchased`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update items purchase state-return group
export async function _updatePurchasedItemsGroup(
  id: string,
  ids: string[],
  value: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/items/updatepurchased`, {ids, value})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update item name-return group
export async function _updateItemGroup(
  id: string,
  itemId: string,
  name: string,
  image: string,
  clear: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/items/update`, {itemId, name, image, clear})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new meal
export async function _addMealGroup(
  id: string,
  userId: string,
  name: string,
  type: string,
  day: string,
  image: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/meals/new`, {userId, name, type, day, image})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get meals
export async function _getMealsGroup(id: string) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/meals/get`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove meals
export async function _deleteMealsGroup(id: string, ids: string[]) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/meals/remove`, {ids})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//remove day meals
export async function _deleteDayMealsGroup(id: string, day: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/meals/removeday`, {day})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update meal
export async function _updateMealGroup(
  id: string,
  mealId: string,
  name: string,
  type: string,
  day: string,
  image: string,
  clear: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/meals/update`, {
      mealId,
      name,
      type,
      day,
      image,
      clear,
    })
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new photo
export async function _addPhotosGroup(
  id: string,
  userId: string,
  images: string[],
  album: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/photos/new`, {userId, images, album})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get photos
export async function _getPhotosGroup(id: string) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/photos/get`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//move photos to another album
export async function _movePhotosGroup(
  id: string,
  ids: string[],
  value: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/photos/move`, {ids, value})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete photos
export async function _deletePhotosGroup(id: string, ids: string[]) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/photos/delete`, {ids})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new album
export async function _addAlbumGroup(id: string, userId: string, name: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/albums/new`, {userId, name})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update album name
export async function _updateAlbumNameGroup(
  id: string,
  albumId: string,
  value: string,
  prevValue: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/albums/updatename`, {albumId, value, prevValue})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete album
export async function _deleteAlbumGroup(
  id: string,
  albumId: string,
  albumName: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/albums/remove`, {albumId, albumName})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new note
export async function _addNoteGroup(
  id: string,
  userId: string,
  title: string,
  text: string,
  pinned: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/notes/new`, {userId, title, text, pinned})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update note
export async function _updateNoteGroup(
  id: string,
  noteId: string,
  title: string,
  text: string,
  pinned: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/notes/update`, {noteId, title, text, pinned})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update pinned notes
export async function _updatePinnedNotesGroup(
  id: string,
  ids: string[],
  value: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/notes/updatepinned`, {ids, value})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete notes
export async function _deleteNotesGroup(id: string, ids: string[]) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/notes/delete`, {ids})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//add event
export async function _addEventGroup(
  id: string,
  event: Omit<groupEventsType, '_id' | 'done'>,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/events/new`, {event})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//add event
export async function _updateEventGroup(id: string, event: groupEventsType) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/events/update`, {event})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update done events
export async function _updateDoneEventGroup(
  id: string,
  eventId: string,
  value: boolean,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/events/updatedone`, {eventId, value})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete past events
export async function _deletePastEventsGroup(id: string, ids: string[]) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/events/deletepast`, {ids})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete event
export async function _deleteEventGroup(id: string, eventId: string) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/events/delete`, {eventId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//new message
export async function _newMessageGroup(
  id: string,
  userId: string,
  text: string,
  date: Date,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/chat/newmessage`, {
      userId,
      text,
      date,
    })
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//load messages
export async function _loadMessagesGroup(id: string, index: number) {
  const client = await getClient();
  const res = client
    .get(`/groups/${id}/chat/loadmessages/${index}`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//diavastike
export async function _diavastikeGroup(
  id: string,
  userId: string,
  messageId: string,
) {
  const client = await getClient();
  const res = client
    .put(`/groups/${id}/chat/diavastike`, {userId, messageId})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

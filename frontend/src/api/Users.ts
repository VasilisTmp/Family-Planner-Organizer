import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

import {API_URL} from './config';

async function getClient() {
  const accessToken = (await EncryptedStorage.getItem('accessToken')) || '';
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return client;
}

//new user-return new user
export async function _newUser(
  username: string,
  email: string,
  password: string,
) {
  const res = axios
    .post(`${API_URL}/users/new`, {username, email, password})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//delete user and everything related from the group
export async function _deleteUser(id: string) {
  const client = await getClient();
  const res = client
    .delete(`/users/${id}/delete`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

// login check-return user
export async function _logInUser(email: string, password: string) {
  const client = await getClient();
  const res = client
    .post(`/users/login`, {email, password})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update username
export async function _updateUsernameUser(id: string, name: string) {
  const client = await getClient();
  const res = client
    .put(`/users/${id}/updateusername`, {name})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//update birthdate
export async function _updateBirthdateUser(id: string, date: string) {
  const client = await getClient();
  const res = client
    .put(`/users/${id}/updatebirthdate`, {date})
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get groups of user
export async function _getGroupsUser(id: string) {
  const client = await getClient();
  const res = client
    .get(`/users/${id}/getgroups`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

//get password of user
export async function _getPasswordUser(id: string) {
  const client = await getClient();
  const res = client
    .get(`/users/${id}/getpassword`)
    .then(res => res.data)
    .catch(err => console.log('error', err));
  return res;
}

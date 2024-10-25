import io from 'socket.io-client';

import {API_URL} from '../api/config';

const socket = io(API_URL, {forceNew: true});

export default socket;

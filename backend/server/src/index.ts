import express, {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const {auth} = require('express-oauth2-jwt-bearer');
const app = express();
import {Socket, Server} from 'socket.io';
import SocketListener from './utils/SocketListener';
const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
var path = require('path');
import helmet from 'helmet';

const options = {
  key: fs.readFileSync(path.resolve('localhost-key.pem')),
  cert: fs.readFileSync(path.resolve('localhost.pem')),
};
const https = require('https').Server(options, app);
// const requestIp = require('request-ip');

const audience = `https://${process.env.AUTH0_DOMAIN}/api/v2/`;
const checkJwt = auth({
  audience: audience,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

function myCheckJwt(req: Request, res: Response, next: NextFunction) {
  if (
    req.path.includes('users/new') ||
    req.path.includes('login') ||
    req.path.includes('ping')
  ) {
    next();
  } else {
    checkJwt(req, res, next);
  }
}

// function getIP(req: any, res: Response, next: NextFunction) {
//   console.log(req.clientIp);
//   next();
// }

const PORT = 5000;

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://myproject-c60eb-default-rtdb.europe-west1.firebasedatabase.app',
});

const socketIO = new Server();
socketIO.attach(https);

//👇🏻 Add this before the app.get() block
socketIO.on('connection', (socket: Socket) => {
  SocketListener(socket, admin);
});

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body); // Requires body-parser or similar middleware for JSON/form data
//   next(); // Continue to the next middleware or route handler
// });
app.use(helmet());

app.use(cors({origin: '*'}));
app.use(express.json({limit: '50mb'}));
// app.use(requestIp.mw());
// app.use(getIP);
app.use(myCheckJwt);

app.get('/ping', (req: Request, res: Response) => {
  res.json(true);
});

const usersRoutes = require('./router/UsersRoutes');
app.use('/users', usersRoutes);
const groupsRoutes = require('./router/GroupsRoutes');
app.use('/groups', groupsRoutes);
mongoose
  .set('strictQuery', true)
  .connect(process.env.DB_CONN_STRING || '')
  .then(() => {
    console.log(`listening on port ${PORT}`);
    https.listen(PORT);
  });

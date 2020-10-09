import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserController from './controllers/user.controller.js';
import AuthController from './controllers/auth.controller.js';
import bodyParser from 'body-parser';
import { localStrategy, jwtStrategy } from './passport.js';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import path from 'path';
import { __dirname } from './const.js';

dotenv.config();
const port = process.env.PORT_CONNEXION;
const urlDb = process.env.URL_DB_CONNEXION;
mongoose.connect(urlDb, { useNewUrlParser: true, useUnifiedTopology: true });
export const db = mongoose.connection;
export const app = express();
const MongoStore = connectMongo(session);
localStrategy(passport);
jwtStrategy(passport);

app.use(bodyParser.json()); // for parsing application/json
app.use(session({
  store: new MongoStore({ mongooseConnection: db }),
  resave: true,
  saveUninitialized: true,
  secret: 'coucou'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', UserController);
app.use('/auth', AuthController);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

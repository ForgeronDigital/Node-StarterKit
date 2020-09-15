import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserController from './controllers/user.controller.js';
import bodyParser from 'body-parser';
import passport from 'passport';
import initializePassport from './passport.js';

initializePassport(passport);
dotenv.config();
const port = process.env.PORT_CONNEXION;
const urlDb = process.env.URL_DB_CONNEXION;
mongoose.connect(urlDb, { useNewUrlParser: true, useUnifiedTopology: true });

export const db = mongoose.connection;
export const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencodedapp

app.use('/user', UserController);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

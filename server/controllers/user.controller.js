import express from 'express';
import { User } from '../models/user.js';
import { db } from '../app.js';
import passport from 'passport';
import {
  validateAndSaveIncommingData,
  validateAndUpdateNewData,
  findOne,
} from '../services/service.js';
import { v4 as uuidv4 } from 'uuid';

let router = express.Router();

router
  .get('/:userUuid', passport.authenticate('local'), async (req, res) => {
    res.send(await findOne('users', req.params.userUuid));
  })
  .post('/', async (req, res) => {
    const user = new User(req.body);
    user.uuid = uuidv4();
    user.createdAt = Date.now();
    res.send(await validateAndSaveIncommingData(user, 'user'));
  })
  .delete('/:userUuid', async (req, res) => {
    const user = await findOne('users', req.params.userUuid);
    if (user) {
      db.collection('users').deleteOne(user);
      res.send('user deleted');
    }
  })
  .patch('/:userUuid', async (req, res) => {
    const user = new User(req.body);
    const ressource = await findOne('users', req.params.userUuid);
    if (ressource) {
      user._id = ressource._id;
      user.updatedAt = Date.now();
      res.send(
        await validateAndUpdateNewData(ressource, user, 'user', 'users')
      );
    }
  });

export default router;

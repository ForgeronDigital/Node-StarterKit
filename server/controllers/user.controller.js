import express from 'express';
import { User } from '../models/user.js';
import { db } from '../app.js';
import {
  validateIncommingData,
  findByUuid,
  findAll
} from '../services/service.js';
import {
  verifyToken,
  verifyMe,
  isAdmin
  // checkAuthentication
} from '../services/auth.service.js'

let router = express.Router({ mergeParams: true });

router
  // passport local strategy
  // .get('/', checkAuthentication, async (req, res) => {
  //   res.send(await findAll('users'));
  // })

  // passport jwt strategy
  .get('/',
    verifyToken,
    async (req, res, next) => {
      res.status(200).send(await findAll('users'));
    })

  .get('/:userUuid',
    verifyToken,
    (req, res, next) => { verifyMe(req) ? next() : res.status(401).json({ success: false, msg: 'you don\'t have the permission to access user other than you' }) },
    async (req, res, next) => {
      res.send(await findByUuid('users', req.params.userUuid));
    })

  .delete('/:userUuid',
    verifyToken,
    (req, res, next) => { (verifyMe(req) || isAdmin(req)) ? next() : res.status(401).json({ success: false, msg: 'you don\'t have the permission to access user other than you' }) },
    async (req, res) => {
      const user = await findByUuid('users', req.params.userUuid);
      if (user.uuid) {
        db.collection('users').deleteOne(user);
        res.send('user deleted');
      } else { res.status(user.status).json(user.msgError) }
    })

  .patch('/:userUuid',
    verifyToken,
    (req, res, next) => { (verifyMe(req) || isAdmin(req)) ? next() : res.status(401).json({ success: false, msg: 'you don\'t have the permission to access user other than you' }) },
    async (req, res) => {
      const user = await User.findOne({ uuid: req.params.userUuid });
      if (user) {
        const error = await validateIncommingData(req.body, 'user');
        if (error) {
          res.status(error.status).json(error.msgError)
        } else {
          const patchDataUser = new User(req.body);
          patchDataUser._id = user._id;
          patchDataUser.uuid = user.uuid;
          patchDataUser.email = user.email;
          patchDataUser.updatedAt = Date.now();
          const response = await User.findOneAndUpdate({ uuid: patchDataUser.uuid }, { $set: patchDataUser });
          res.send(response);
        }
      } else {
        res.status(404).json({ success: false, msg: "ressource not found" })
      }
    });

export default router;

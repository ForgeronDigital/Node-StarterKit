import express from 'express';
import { User } from '../models/user.js';
import {
  validateIncommingData
} from '../services/service.js';
import { hashPassword, isPasswordCorrect, issueJWT } from '../services/auth.service.js'
import { v4 as uuidv4 } from 'uuid';

let router = express.Router();

router
  // .post("/login", passport.authenticate('local',
  // { failureMessage: 'password or username not correct', successMessage: "nice catchy", successRedirect: "/user/" }), (req, res) => {
  // })
  .post('/register', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = await validateIncommingData(req.body, 'user');
      if (error) {
        res.status(error.status).json(error.msgError)
      } else {
        const user = new User(req.body);
        user.uuid = uuidv4();
        user.createdAt = Date.now();
        user.passwordHash = hashPassword(req.body.password).hash;
        user.salt = hashPassword(req.body.password).salt;
        res.send(await user.save());
      }
    } else {
      res.status(409).json({ success: false, msg: "email already taken" })
    }
  })
  .post("/login", (req, res, next) => {
    User.findOne({ email: req.body.username })
      .then((user) => {
        if (!user) {
          res.status(401).json({ success: false, msg: "could not find user" });
        }
        const isValid = isPasswordCorrect(user.passwordHash, user.salt, req.body.password);
        if (isValid) {
          const tokenObject = issueJWT(user);
          res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
        } else {
          res.status(401).json({ success: false, msg: "you entered the wrong password" });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  // for local strategy
  .get("/logout", (req, res) => {
    req.logout();
    res.redirect('/user');
  })

export default router;

import passport from "passport";
import LocalStrategy from 'passport-local';
import pkg from 'passport-jwt';
import { User } from "./models/user.js";
import { isPasswordCorrect } from './services/auth.service.js';
import path from 'path';
import fs from 'fs';
import { __dirname } from './const.js'

const pathToKey = path.join(__dirname, '/server', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch(err => done(err))
});

export const localStrategy = passport => {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      User.findOne({ email: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!isPasswordCorrect(user.passwordHash, user.salt, password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ))
};

export const jwtStrategy = passport => {
  const { Strategy, ExtractJwt } = pkg;
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
  };
  passport.use(
    new Strategy(options, (jwt_payload, done) => {
      User.findOne({ uuid: jwt_payload.sub }, (err, user) => {
        if (err) return done(err, false);
        if (user) {
          return done(null, {
            email: user.email,
            _id: user.uuid
          });
        } else {
          return done(null, false)
        }
      });
    })
  );
};

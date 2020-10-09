import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../const.js';
import passport from 'passport';
import { findByUuid } from './service.js'

const iterations = 10000;
const salt = crypto.randomBytes(128).toString('hex');
const pathToKey = path.join(__dirname, '/server', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

export const hashPassword = (password) => {
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
  return {
    salt: salt,
    hash: hash,
  };
}

export const isPasswordCorrect = (savedHash, savedSalt, passwordAttempt) => {
  return savedHash == crypto.pbkdf2Sync(passwordAttempt, savedSalt, iterations, 64, 'sha256').toString('hex');
}

export const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

export const verifyToken = (req, res, next) => {
  let token;
  const dateNow = new Date();
  if (req.header('authorization').startsWith("Bearer ")) {
    token = req.header('authorization').substring(7, req.header('authorization').length);
    const decodedToken = jsonwebtoken.verify(token, PRIV_KEY, { algorithms: ['RS256'] });
    if (decodedToken.exp > dateNow.getTime()) {
      passport.authenticate('jwt', { session: false });
      next();
    } else {
      res.status(401).json({ success: false, msg: 'token expired, please login' });
    }
  } else {
    res.status(401).json({ success: false, msg: 'please login before access this route' });
  }
}

// pass data you want to be decoded and accessible
export const issueJWT = (user) => {
  const uuid = user.uuid;
  const expiresIn = '30d';
  const payload = {
    sub: uuid,
    iat: Date.now(),
  };
  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  }
}

export const verifyMe = (req) => {
  const token = req.header('authorization').substring(7, req.header('authorization').length);
  const decodedToken = jsonwebtoken.verify(token, PRIV_KEY, { algorithms: ['RS256'] });
  return decodedToken.sub === req.params.userUuid
}

export const isAdmin = (req) => {
  const token = req.header('authorization').substring(7, req.header('authorization').length);
  const decodedToken = jsonwebtoken.verify(token, PRIV_KEY, { algorithms: ['RS256'] });
  const user = findByUuid('users', req.params.userUuid);
  if (user) {
    return user.admin
  } else { return false }
}

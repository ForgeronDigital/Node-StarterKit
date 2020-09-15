import LocalStrategy from 'passport-local';

const authenticateUser = (email, password, done) => {};

export default (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }),
    authenticateUser()
  );
  passport.serializeUser((user, done) => {});
  passport.deserializeUser((user, done) => {});
};

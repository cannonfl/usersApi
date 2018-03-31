'use strict';
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      let {id, name, emails, gender, provider} = profile;
      
      const existingUser = await User.findOne({ providerId: id });
      if (existingUser) {
        return done(null, existingUser);
      }

      let docRec = {
        provider,
        id,
        firstName: name.givenName,
        lastName: name.familyName,
        gender,
        email: emails[0].value
      }
      const user = await new User(docRec).save();
      done(null, user);
    }
  )
);
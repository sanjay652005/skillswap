const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Lazy initialize — called after dotenv is loaded
const initPassport = () => {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        if (!user.avatar && profile.photos[0]?.value) {
          user.avatar = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      }
      user = new User({
        name:     profile.displayName,
        email:    profile.emails[0].value,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        avatar:   profile.photos[0]?.value || '',
        bio:      '',
        skillsOffered: [],
        skillsWanted:  [],
        availability:  'flexible',
      });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) { done(err, null); }
  });
};

module.exports = { passport, initPassport };
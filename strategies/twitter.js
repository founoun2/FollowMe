const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
  consumerKey: 'YOUR_TWITTER_CONSUMER_KEY',
  consumerSecret: 'YOUR_TWITTER_CONSUMER_SECRET',
  callbackURL: '/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
  // Save profile info to DB
  done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

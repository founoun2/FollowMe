const express = require('express');
const passport = require('passport');
const session = require('express-session');

// Import strategies
// You will create these files next
require('./strategies/google');
require('./strategies/facebook');
require('./strategies/twitter');

const app = express();

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Save user info to DB here
  res.redirect('/');
});

// Facebook OAuth
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  // Save user info to DB here
  res.redirect('/');
});

// Twitter OAuth
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {
  // Save user info to DB here
  res.redirect('/');
});

app.listen(3001, () => console.log('OAuth server running on port 3001'));

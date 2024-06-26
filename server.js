const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const mysql = require('mysql2');
const crypto = require('crypto');

// Generate a random string of 32 characters
const secretKey = crypto.randomBytes(32).toString('hex');

console.log(secretKey);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: secretKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'root'
});


// Passport configuration
passport.use(new Auth0Strategy({
  domain: 'niacloud.us.auth0.com',
  clientID: '0mOWQuQOQB32P3HKMPNtBq1ndq7DNFki',
  clientSecret: '0aDzJuzhsGcjG2CPZYIf-FcU9Q6PSThXT0bdoTzpZtaPWMrToGt0finUnzPlw3rH',
  callbackURL: 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
  // You can use profile information to find or create a user in your database
  // In this example, we'll just use a mock user
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the COHS Admin Dashboard');
});

// Login Route
app.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), (req, res) => {
  res.redirect('/');
});

// Callback Route
app.get('/callback', passport.authenticate('auth0', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/dashboard');
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Welcome to Dashboard');
  } else {
    res.redirect('/login');
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// Server Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

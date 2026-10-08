const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const { randomBytes } = require('node:crypto');
const db = require('./db');

passport.use(new Strategy(function(username, password, cb) {
  db.users.findByUsername(username, function(err, user) {
    if (err) return cb(err);
    if (!user || user.password !== password) return cb(null, false);
    return cb(null, user);
  });
}));
passport.serializeUser(function(user, cb) { cb(null, user.id); });
passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
});

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', function(req, res) { res.render('home', { user: req.user }); });
app.get('/home', require('connect-ensure-login').ensureLoggedIn('/login'), function(req, res) {
  res.render('home', { user: req.user });
});
app.get('/login', function(req, res) { res.render('login', { error: req.query.error === '1' }); });
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login?error=1'
}), function(req, res) { res.redirect('/'); });
app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(function(err) {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});
if (require.main === module) {
  app.listen(process.env.PORT || 3000, '127.0.0.1', function() {
    console.log('Authentication demo: http://127.0.0.1:' + (process.env.PORT || 3000));
  });
}
module.exports = app;

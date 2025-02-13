const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const port = process.env.PORT || 3000;
const app = express();

// Separate initialization function
const initializeApp = async () => {
  return new Promise((resolve, reject) => {
    mongodb.initDb((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

app.use(express.json());

app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
// This is the basic express session({..}) initialization.
app.use(passport.initialize());
// Init passport on every route call
app.use(passport.session());
// Allow passport to use "express-session".
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, OPTIONS, DELETE');
  next();
});

app.use(cors({ method: ['GET', 'POST', 'PUT', 'UPDATE', 'PATCH', 'DELETE'] }));
app.use(cors({ origin: '*' }));
app.use('/', require('./routes'));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
  function (accessToken, refreshToken, profile, done) { 
    // User.findOrCreate({githubId: profile.id}, function(err, user) {
    return done(null, profile)
    // })
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => { 
  done(null, user);
});

app.get('/', (req, res) => {
  /*
    #swagger.summary='Gets a string with the logged in status'
    #swagger.description='Gets a string with the logged in status'
  */
  res.send(req.session.user !== undefined ? `Logged in as ${req.session.user.displayName??req.session.user.username}` : 'Logged Out')
});

app.get('/github/callback', /* #swagger.tags=['OAuth'] #swagger.summary='Gets a string with the logged in status' #swagger.description='Gets a string with the logged in status' */ passport.authenticate('github', {
  failureRedirect: '/api-docs', session: false
}),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  });

// mongodb.initDb((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     app.listen(port, () => {
//       console.log(`Database is listening and running on port ${port}`);
//     });
//   }
// });

// Only start the server if this file is run directly
if (require.main === module) {
  initializeApp()
    .then(() => {
      app.listen(port, () => {
        console.log(`Database is listening and running on port ${port}`);
      });
    })
    .catch(console.error);
}

app.use(function (error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  } else {
    res.status(error.status || 500);
    res.send({
      error
    });
  }
});

module.exports = { app, initializeApp };
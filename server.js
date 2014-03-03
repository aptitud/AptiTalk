// Librairies
var express = require('express'),
  app = express.createServer();

var http = require('http'),
  io = require('socket.io').listen(app);

var passport = require('passport'),
  util = require('util'),
  GoogleStrategy = require('passport-google').Strategy;

var jade = require('jade');
var mode = {
  datasource: 'inmemory',
  debug: false
};
var chat = require('./lib/chat.js');
var google = require('./lib/google.js');
var hashTagParser = require('./lib/hashtagparser.js');
var dbAccess = require('./lib/dbAccess/dbAccess');
var config = require('./config')();

dbAccess.connectToDb(config.mongoUrl);

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.configure(function () {
  // Views Options
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set("view options", {
    layout: false
  });
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: 'aptitud'
  }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.favicon("favicon.ico"));
  app.use(app.router);
});

if (config.authentication === 'google') {
  // Render and send the main page
  app.get('/', google.ensureAuthenticated, function (req, res) {
    console.log('req.user', req.user);
    res.render('home', {
      user: req.user,
      internet: config.internet
    });
  });

  app.get('/hashtags/:hashtag', google.ensureAuthenticated, function (req, res) {
    /*
    chat.getPostsForHashtag(req.params.hashtag, function (tagWithPosts) {
      console.log(hashtags);

      res.render('hashtags', {
        name: '#' + tagWithPosts.tag,
        // TODO: I don't get this, shouldn't this be "posts"
        // and not "hashtags"?
        // I send in a hashtags and ... get a list of all post it exists in?
        // I thought so and have now change it into that, but then the
        // property name below here should be changed too, right?
        // And what are we returning btw, the message?
        // I'm confused and have probably messed this up... Sorry
        hashtags: JSON.stringify(tagWithPosts.posts)
      });
    });
  */
  });
} else {
  // Render and send the main page
  app.get('/', google.bypassAuthenticated, function (req, res) {
    console.log('req.user', req.user);
    res.render('home', {
      user: {
        identifier: 'unknown',
        displayName: 'not authenticated',
        emails: ['unknown@not.authenticated']
      },
      internet: config.internet
    });
  });

  app.get('/hashtags/:hashtag', google.bypassAuthenticated, function (req, res) {
    /*
  chat.getPostsForHashtag(req.params.hashtag, function (tagWithPosts) {
    console.log(hashtags);

    res.render('hashtags', {
      name: '#' + tagWithPosts.tag,
      // TODO: I don't get this, shouldn't this be "posts"
      // and not "hashtags"?
      // I send in a hashtags and ... get a list of all post it exists in?
      // I thought so and have now change it into that, but then the
      // property name below here should be changed too, right?
      // And what are we returning btw, the message?
      // I'm confused and have probably messed this up... Sorry
      hashtags: JSON.stringify(tagWithPosts.posts)
    });
  });
*/
  });
}

app.get('/login', function (req, res) {
  console.log('req.user', req.user);
  res.render('login', {
    user: req.user,
    internet: config.internet
  });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /auth/google/return
app.get('/auth/google',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/return',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });

app.listen(config.appPort);

console.log("Server listening on port " + config.appPort);
console.log("AppPort:" + config.appPort);
console.log("Realm:" + config.realm);
console.log("ReturnUrl:" + config.returnUrl);
console.log("Authentication:" + config.authentication);
console.log("Internet:" + config.internet);

io.sockets.on('connection', function (socket) {
  chat.connection(io, socket, mode);
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
  returnURL: config.returnUrl,
  realm: config.realm
}, function (identifier, profile, done) {
  if (profile.emails.length === 0) {
    return done("Not a valid user");
  }

  var email = profile.emails[0].value.toLowerCase();
  if (email.indexOf("aptitud.se") === -1) {
    return done("You need to be a valid Aptitud user");
  }
  profile.identifier = identifier;
  console.log(profile);

  return done(null, profile);
}));
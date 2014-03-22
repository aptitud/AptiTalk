// Librairies
var express = require('express'),
  app = express.createServer();

var http = require('http'),
  io = require('socket.io').listen(app);

var passport = require('passport'),
  util = require('util');

var jade = require('jade');
var chat = require('./lib/chat.js');
var google = require('./lib/google.js');
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
  console.log('Serializing user:', user);
  dbAccess.serializeUser(user, function (err, user) {
    console.log('User serialized:', user);
    done(err, user);
  });
});

passport.deserializeUser(function (id, done) {
  console.log('Deserializing user with id:', id);
  dbAccess.deserializeUser(id, function (err, user) {
    console.log('User deserialized:', user);
    done(err, user);
  });
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

// Render and send the main page
app.get('/', google.ensureAuthenticated, function (req, res) {
  chat.getPosts(function (posts) {
    console.log('SERVER - posts', posts);
    res.render('home', {
      user: req.user || {
        _id: '1',
        nickName: 'not authenticated',
        email: ['blaj@blaj.com']
      },
      internet: config.internet,
      posts: posts
    });
  });
});

app.get('/hashtags/:hashtag', google.ensureAuthenticated, function (req, res) {
  chat.getPostsForHashtag(req.params.hashtag, function (tagWithPosts) {
    console.log(tagWithPosts);
    res.render('hashtags', {
      user: req.user || {
        _id: '1',
        nickName: 'not authenticated',
        email: ['blaj@blaj.com']
      },
      name: '#' + tagWithPosts.tag,
      internet: config.internet,
      posts: tagWithPosts.posts
    });
  });
});

app.get('/login', function (req, res) {
  console.log('req.user', req.user);
  res.render('login', {
    user: req.user,
    internet: config.internet,
    client_id: '724017344869-j5tsp6sbus8b052q9cpcjhhv1f1m34u0.apps.googleusercontent.com'
  });
});


app.listen(config.appPort);

console.log("Server listening on port " + config.appPort);
console.log("AppPort:" + config.appPort);
console.log("Client:" + config.client);
console.log("Api:" + config.api);
console.log("Authentication:" + config.authentication);
console.log("Internet:" + config.internet);

io.sockets.on('connection', function (socket) {
  chat.connection(io, socket);
});

var GooglePlusStrategy = require('passport-google-plus');

passport.use(new GooglePlusStrategy({
  clientId: config.client,
  apiKey: config.api
}, function (tokens, profile, done) {

  google.verifyUser(profile.email, function (err, isOk) {
    if (err || isOk === false) {
      return done(err, null);
    }

    done(null, profile, tokens);
  });
}));

app.all('/auth/google/callback', passport.authenticate('google'), function (req, res) {
  // Return user profile back to client
  console.log('SERVER - user', req.user);
  res.send(req.user);
});
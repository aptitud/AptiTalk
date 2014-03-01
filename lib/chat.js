// Handle the socket.io connections
var xss = require(__dirname + '/xss.js');
var linkParser = require(__dirname + '/linkparser.js');
var hashTagParser = require(__dirname + '/hashtagparser.js');
var dbAccess = require("./dbAccess/dbAccess");

var users = 0; //count the users
var io;
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var mode;

function reloadUsers() { // Send the count of the users to all
  io.sockets.emit('nbUsers', {
    "nb": users
  });
}

function arrayObjectIndexOf(myArray, searchTerm, property) {
  var i = 0;
  var len = myArray.length;
  for (i = 0; i < len; i++) {
    if (myArray[i][property] === searchTerm) {
      return i;
    }
  }
  return -1;
}

function xssIt (message) {
  return xss
    .XSS
    .toStaticHTML(
      hashTagParser
        .toStaticHTML(
            linkParser.toStaticHTML(message)));
}

var createPost = function (user, message, callback) {

  dbAccess.addPost(user, xssIt(message), hashTagParser.getHashTags, function (result) {
    if(!result.success){
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.createPost = createPost;

var replyPost = function (id, user, message, callback) {
  dbAccess.addReply(id, user, xssIt(message), function (result) {
    if(!result.success){
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.replyPost = replyPost;

var getPost = function (id, callback) {
  dbAccess.getPostById(id, function (result) {
    if(!result.success){
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.getPost = getPost;

var getPostsForHashtag =  function (tag, callback) {
  dbAccess.getPostsForHashtag(tag, function (result) {
    if(!result.success){
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.getPostsForHashtag = getPostsForHashtag;

var getPosts = function (callback) {

  //TODO:  THIS SHOULD BE A PARAMETER FROM THE CLIENT
  // HARDCODED TO ALWAYS RETURN LAST 10 (FIRST PAGE)
  dbAccess.getAllPosts(1, function (result) {
    if(!result.success){
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.expots.getPost = getPosts;

exports.connection = function (theIo, socket, theMode) { // First connection
  io = theIo;
  mode = theMode;
  users += 1; // Add 1 to the count
  reloadUsers(); // Send the count to all the users

  socket.on('getPosts', function () {
    getPosts(function (posts) {
      socket.emit('loadPosts', posts);
    });
  });

  socket.on('reply', function (reply) {
    replyPost(reply.postId, reply.user, reply.message, function (reply) {
      console.log('replyAdded', replyAdded);
      socket.emit('replyAdded', reply.postId, replyAdded);
      socket.broadcast.emit('replyAdded', reply.postId, replyAdded);
    });
  });

  socket.on('post', function (post) {
    createPost(post.user, post.message, function (post) {
      console.log('postAdded', postAdded);
      socket.emit('postAdded', postAdded);
      socket.broadcast.emit('postAdded', postAdded);
    });
  });

  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
  });
};
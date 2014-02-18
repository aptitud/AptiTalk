// Handle the socket.io connections
var xss = require(__dirname + '/xss.js');
var linkParser = require(__dirname + '/linkparser.js');
var hashTagParser = require(__dirname + '/hashtagparser.js');
var users = 0; //count the users
var io;
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var posts = [];
var hashTags = [];
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

function newPost(id, user, message) {
  var tags = hashTagParser.getHashTags(message);
  var post = {
    id: id,
    date: new Date().toISOString(),
    user: user,
    message: xss.XSS.toStaticHTML(hashTagParser.toStaticHTML(linkParser.toStaticHTML(message))),
    hashtags: tags,
    replies: []
  };
  return post;
}

function createPost(user, message) {
  var post = newPost(posts.length, user, message);

  var i = 0;
  var element;
  var objectIndex;
  var newHashTag;

  for (i = 0; i < post.hashtags.length; i++) {
    element = post.hashtags[i];
    objectIndex = arrayObjectIndexOf(hashTags, element, 'name');
    if (objectIndex === -1) {
      newHashTag = {
        name: element,
        posts: [post]
      };
      hashTags.push(newHashTag);
    } else {
      hashTags[objectIndex].posts.push(post);
    }
  }

  return post;
}

function replyPost(id, user, message) {
  var post = posts[id];
  console.log('Posts', posts);
  console.log('Post', post);
  var reply = newPost(post.replies.length, user, message);
  post.replies.push(reply);
  return reply;
}

function storePost(post) {
  posts.push(post);
  return post.id;
}

function getPosts() {
  return posts;
}

function getPost(id) {
  return posts[id];
}

exports.getHashTag = function (hashTag) {
  var objectIndex = arrayObjectIndexOf(hashTags, hashTag, 'name');
  return hashTags[objectIndex];
};

exports.createPost = function (user, message) {
  return createPost(user, message);
};

exports.replyPost = function (id, user, message) {
  return replyPost(id, user, message);
};

exports.storePost = function (post) {
  return storePost(post);
};

exports.getPosts = function () {
  return getPosts();
};

exports.getPost = function (id) {
  return getPost(id);
};

function loadPosts() {
  if (mode.datasource === 'inmemory' && mode.debug === true) {
    posts = [];
    var id = storePost(createPost('hugo', 'First'));
    replyPost(id, 'marcus', 'Reply to First');
    replyPost(id, 'kalle', 'Reply to Self');
    replyPost(id, 'anders', 'Reply to Reply');
    id = storePost(createPost('marcus', 'Second'));
    replyPost(id, 'marcus', 'Reply to Second');
    replyPost(id, 'kalle', 'Reply to Self');
    replyPost(id, 'anders', 'Reply to Reply');
  }
}

exports.connection = function (theIo, socket, theMode) { // First connection
  io = theIo;
  mode = theMode;
  users += 1; // Add 1 to the count
  reloadUsers(); // Send the count to all the users
  loadPosts();

  socket.on('getPosts', function () {
    loadPosts();
    socket.emit('loadPosts', posts);
  });

  socket.on('reply', function (reply) {
    var post = posts[reply.postId];
    var replyAdded = replyPost(post.id, reply.user, reply.message);
    console.log('replyAdded', replyAdded);
    socket.emit('replyAdded', reply.postId, replyAdded);
    socket.broadcast.emit('replyAdded', reply.postId, replyAdded);
  });

  socket.on('post', function (post) {
    var postAdded = createPost(post.user, post.message);
    storePost(postAdded);
    console.log('postAdded', postAdded);
    socket.emit('postAdded', postAdded);
    socket.broadcast.emit('postAdded', postAdded);
  });

  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
  });
};
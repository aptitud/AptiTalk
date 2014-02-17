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

function createPost(id, user, message) {
  var tags = hashTagParser.getHashTags(message);
  var post = {
    id: id,
    date: new Date().toISOString(),
    user: user,
    message: xss.XSS.toStaticHTML(hashTagParser.toStaticHTML(linkParser.toStaticHTML(message))),
    hashTags: tags,
    replies: []
  };

  var i = 0;
  var element;
  var objectIndex;
  var newHashTag;
  for (i = 0; i < tags.length; i++) {
    element = tags[i];
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

exports.reset = function () {
  posts = [];
  hashTags = [];
};

exports.getHashTag = function (hashTag) {
  var objectIndex = arrayObjectIndexOf(hashTags, hashTag, 'name');
  return hashTags[objectIndex];
};

exports.createPost = function (id, user, message) {
  return createPost(id, user, message);
};

function loadPosts() {
  if (mode.datasource === 'inmemory' && mode.debug === true) {
    posts = [];
    posts.push(createPost(0, 'hugo', 'First'));
    posts[0].replies.push(createPost(0, 'marcus', 'Reply to First'));
    posts[0].replies.push(createPost(1, 'kalle', 'Reply to Self'));
    posts[0].replies.push(createPost(2, 'anders', 'Reply to Reply'));
    posts.push(createPost(1, 'marcus', 'Second'));
    posts[1].replies.push(createPost(0, 'hugo', 'Reply to Second'));
    posts[1].replies.push(createPost(1, 'marcus', 'Reply to Self'));
    posts[1].replies.push(createPost(2, 'anders', 'Reply to Reply'));
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
    var post = posts[reply.postId - 1];
    var replyAdded = createPost(post.replies.length, reply.user, reply.message);
    post.replies.push(replyAdded);
    console.log('replyAdded', replyAdded);
    socket.emit('replyAdded', reply.postId, replyAdded);
    socket.broadcast.emit('replyAdded', reply.postId, replyAdded);
  });

  socket.on('post', function (post) {
    var postAdded = createPost(posts.length + 1, post.user, post.message);
    posts.push(postAdded);
    console.log('postAdded', postAdded);
    socket.emit('postAdded', postAdded);
    socket.broadcast.emit('postAdded', postAdded);
  });

  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
  });
};
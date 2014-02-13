// Handle the socket.io connections

var users = 0; //count the users
var io;
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var posts = [];
var mode;

function reloadUsers() { // Send the count of the users to all
  io.sockets.emit('nbUsers', {
    "nb": users
  });
}

function pseudoSet(socket) { // Test if the user has a name
  var test;
  if (mode.datasource === 'inmemory') {
    return true;
  }
  socket.get('pseudo', function (err, name) {
    if (name === null) {
      test = false;
    } else {
      test = true;
    }
  });
  return test;
}

function returnPseudo(socket) { // Return the name of the user
  var pseudo;
  socket.get('pseudo', function (err, name) {
    if (name === null) {
      pseudo = false;
    } else {
      pseudo = name;
    }
  });
  return pseudo;
}

function createPost(id, user, message) {
  var post = {
    id: id,
    date: new Date().toISOString(),
    user: user,
    message: message,
    replies: []
  };

  return post;
}

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
  } else {

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
    io.sockets.emit('loadPosts', posts);
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
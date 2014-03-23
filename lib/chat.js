// Handle the socket.io connections
var xss = require(__dirname + '/xss.js');
var linkParser = require(__dirname + '/linkparser.js');
var hashTagParser = require(__dirname + '/hashtagparser.js');
var dbAccess = require(__dirname + '/dbAccess/dbAccess');

var users = 0; //count the users
var io;
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var clients = [];
var async = require("async");

function reloadUsers() { // Send the count of the users to all
  io.sockets.emit('nbUsers', {
    "nb": users
  });
}

var getClientById = function (id, next) {
  var i;
  var client;
  for (i = 0; i < clients.length; i++) {
    client = clients[i];
    if (client.id === id) {
      console.log('SERVER - found client: ', clients[i]);
      next(null, client);
      console.log('SERVER - remaining clients: ', clients);
      return;
    }
  }

  next('Could not find client with id:' + id, null);
};

var disconnectClientById = function (id) {
  var i;
  var client;
  for (i = 0; i < clients.length; i++) {
    client = clients[i];
    if (client.id === id) {
      console.log('SERVER - disconnected client: ', clients[i]);
      clients.splice(i, 1);
      console.log("SERVER - remaining clients: ", clients);
      return;
    }
  }
};


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

function xssIt(message) {
  return xss.XSS.toStaticHTML(hashTagParser.toStaticHTML(linkParser.toStaticHTML(message)));
}

var createPost = function (user, message, callback) {
  dbAccess.addPost(user, message, xssIt, hashTagParser.getHashTags, function (result) {
    if (result.success === false) {
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.createPost = createPost;

var replyPost = function (id, user, message, callback) {
  dbAccess.addReply(id, user, message, xssIt, hashTagParser.getHashTags, function (result) {
    if (result.success === false) {
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    callback(result.data);
  });
};
module.exports.replyPost = replyPost;

var postSorter = function (post1, post2) {
  if (post1.time > post2.time) {
    return -1;
  }
  if (post1.time < post2.time) {
    return 1;
  }

  return 0;
};

var loadPicturesForPosts = function (result, next) {
  var posts = [];
  var postWithPic = {};
  // 1st parameter in async.each() is the array of items
  async.each(result,
    // 2nd parameter is the function that each item is passed into
    function (item, callback) {
      loadPicturesForPosts(item.replies, function (err, replies) {
        if (err) {
          callback(err);
          return;
        }
        dbAccess.getUserByNickName(item.username, function (err, user) {
          if (!err) {
            postWithPic = item;
            if (user !== null && user.picture !== undefined) {
              postWithPic.picture = user.picture;
            }
            posts.push(postWithPic);
            callback();
          }
        });
      });
    },
    // 3rd parameter is the function call when everything is done
    function (err) {
      // All tasks are done now
      next(err, posts.sort(postSorter));
    });
};

var getPost = function (id, callback) {
  dbAccess.getPostById(id, function (result) {
    if (result.success === false) {
      console.log(result.errorMessage);
      callback(result);
      return;
    }

    var postsWithOutPics = [];
    postsWithOutPics.push(result.data);
    loadPicturesForPosts(postsWithOutPics, function (err, posts) {
      if (err) {
        callback(err);
        return;
      }
      callback(posts[0]);
    });
  });
};

module.exports.getPost = getPost;

var getPostsForHashtag = function (tag, callback) {
  dbAccess.getPostsForHashtag(tag, function (result) {
    if (result.success === false) {
      callback(result);
      return;
    }

    loadPicturesForPosts(result.data.posts, function (err, posts) {
      if (err) {
        callback(err);
        return;
      }
      callback(posts);
    });
  });
};

module.exports.getPostsForHashtag = getPostsForHashtag;

var getPosts = function (callback) {

  //TODO:  THIS SHOULD BE A PARAMETER FROM THE CLIENT
  // HARDCODED TO ALWAYS RETURN LAST 10 (FIRST PAGE)
  dbAccess.getAllPosts(0, function (result) {
    if (result.success === false) {
      callback(result);
      return;
    }

    loadPicturesForPosts(result.data, function (err, posts) {
      if (err) {
        callback(err);
        return;
      }
      callback(posts);
    });
  });
};

module.exports.getPosts = getPosts;

exports.connection = function (theIo, socket) { // First connection
  var client = {};
  client.id = socket.id;
  client.user = {};

  clients.push(client);
  socket.emit('sessionId', client.id);

  io = theIo;
  users += 1; // Add 1 to the count
  reloadUsers(); // Send the count to all the users

  socket.on('reply', function (reply) {
    getClientById(socket.id, function (err, client) {
      if (err) {
        console.log('SERVER - ERROR: ', err);
        return;
      }
      var postId = reply.postId;
      replyPost(postId, client.user.name, reply.message, function (reply) {
        getPost(reply._id, function (reply) {
          console.log('SERVER - replyAdded', reply);
          socket.emit('replyAdded', postId, reply);
          socket.broadcast.emit('replyAdded', postId, reply);
        });
      });
    });
  });

  socket.on('post', function (post) {
    getClientById(socket.id, function (err, client) {
      if (err) {
        console.log('SERVER - ERROR: ', err);
        return;
      }
      createPost(client.user.name, post.message, function (post) {
        getPost(post._id, function (post) {
          console.log('SERVER - postAdded', post);
          socket.emit('postAdded', post);
          socket.broadcast.emit('postAdded', post);
        });
      });
    });
  });

  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
    disconnectClientById(socket.id);
  });

  socket.on('user', function (user, id) {
    console.log(id);
    getClientById(id, function (err, client) {
      if (err) {
        console.log('SERVER - ERROR: ' + err);
        return;
      }

      client.user = user;
    });
  });
};
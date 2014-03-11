var mongoose = require("mongoose");
var model = require(__dirname + '/model.js');
var Post = model.Post;
var User = model.User;

var createSuccess = function (data) {
  return {
    success: true,
    errorMessage: "",
    data: data
  };
};

var createError = function (errorMessage) {
  return {
    success: false,
    errorMessage: errorMessage
  };
};

module.exports.connectToDb = function (connectionString) {
  if (mongoose.connection.readyState === 0) { // not open
    var options = {
      server: {
        socketOptions: []
      },
      replset: {
        socketOptions: []
      }
    };
    options.server.socketOptions = options.replset.socketOptions = {
      keepAlive: 1
    };
    console.log('Connecting to MongoDb with connectionstring:', connectionString);
    console.log('Connecting to MongoDb with options:', options);
    mongoose.connect(connectionString, options);
  }
};

var createPost = function (username, message, xssIt, hashtagParser) {
  var post = new Post();
  post.username = username;
  post.message = xssIt(message);
  post.time = new Date();
  post.hashtags = hashtagParser(message);

  return post;
};

var addPost = function (username, message, xssIt, hashtagParser, callback) {
  if (username === "") {
    callback(createError("Username is required"));
    return;
  }

  if (message === "") {
    callback(createError("Message is required"));
    return;
  }

  var post = createPost(username, message, xssIt, hashtagParser);

  Post.create(post, function (err, p) {
    if (err) {
      callback(createError("Error adding post\n" + err));
      return;
    }
    callback(createSuccess(p));
  });
};
module.exports.addPost = addPost;

var getPostById = function (id, callback) {
  Post
    .findOne({
      _id: id
    })
    .populate("replies")
    .exec(function (err, post) {
      if (err) {
        callback(createError("Post '" + id + "' not found.\n" + err));
        return;
      }

      callback(createSuccess(post));
      return;
    });
};
module.exports.getPostById = getPostById;

module.exports.getAllPosts = function (pageNumber, callback) {
  Post.find({})
    .populate("replies")
    .limit(10)
    .skip(pageNumber)
    .sort({
      time: -1
    })
    .exec(function (err, posts) {
      if (err) {
        callback(createError("Error when getting all posts (page '" + pageNumber + "'\n" + err));
      }

      callback(createSuccess(posts));
    });
};

module.exports.addReply = function (id, username, message, xssIt, hashtagParser, callback) {
  addPost(username, message, xssIt, hashtagParser, function (result) {
    if (result.success === false) {
      callback(result);
      return;
    }

    var reply = result.data;

    Post.update({
        _id: id
      }, {
        $push: {
          replies: reply
        }
      }, {
        safe: true
      },
      function (err, result) {
        if (err) {
          callback(createError("Error updating post with reply."));
          return;
        }

        callback(createSuccess(reply));
      });
  });
};

module.exports.getPostsForHashtag = function (hashtag, callback) {
  Post
    .find({
      hashtags: hashtag
    })
    .populate("replies")
    .exec(function (err, posts) {
      if (err) {
        callback(createError("Error getting hashtag\n" + err));
        return;
      }

      callback(createSuccess({
        tag: hashtag,
        posts: posts
      }));
    });
};

var getUser = function (identifier, callback) {
  User.find({
    identifier: identifier
  })
    .exec(function (err, user) {
      if (err) {
        callback(createError("Error when getting user\n" + err));
      }
      callback(createSuccess(user));
    });
};

var parseNickName = function (email, callback) {
  var nickname = email.split("@");
  if (nickname.length !== 2) {
    callback(createError("Error generating nickname"));
    return;
  }

  nickname = nickname[0].split(".");
  if (nickname.length !== 2) {
    callback(createError("Error generating nickname"));
    return;
  }

  nickname = nickname[0] + nickname[1];

  callback(createSuccess(nickname));
};

var addUser = function (identifier, name, email, callback) {
  getUser(identifier, function (result) {
    if (result.success === false) {
      callback(result);
      return;
    }

    if (result.data.length === 1) {
      callback(result);
      return;
    }

    var user = new User();
    user.identifier = identifier;
    user.name = name;
    user.email = email;

    parseNickName(email, function (nicknameResult) {
      if (nicknameResult.success === false) {
        callback(nicknameResult);
        return;
      }

      user.nickname = nicknameResult.data;
      console.log('User', user);
      User.create(user, function (err, u) {
        if (err) {
          callback(createError("Error adding user\n" + err));
          return;
        }
        callback(createSuccess(u));
      });
    });
  });
};

module.exports.addUser = addUser;

var getAllUsers = function (callback) {
  User.find({})
    .exec(function (err, users) {
      if (err) {
        callback(createError("Error when getting all users\n" + err));
      }
      callback(createSuccess(users));
    });
};

module.exports.getAllUsers = getAllUsers;
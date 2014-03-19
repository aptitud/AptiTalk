var mongoose = require("mongoose");
var model = require(__dirname + '/model.js');
var Post = model.Post;

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

var internalAddPost = function (username, message, replyLevel, xssIt, hashtagParser, callback) {
  if (username === "") {
    callback(createError("Username is required"));
    return;
  }

  if (message === "") {
    callback(createError("Message is required"));
    return;
  }

  var post = createPost(username, message, xssIt, hashtagParser);
  post.replyLevel = replyLevel;

  Post.create(post, function (err, p) {
    if (err) {
      callback(createError("Error adding post\n" + err));
      return;
    }
    callback(createSuccess(p));
  });
};

var addPost = function (username, message, xssIt, hashtagParser, callback) {
  internalAddPost(username, message, 0, xssIt, hashtagParser, function (result) {
    callback(result);
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
  Post.find({
    replyLevel: 0
  })
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
  getPostById(id, function (result) {
    if (result.success === false) {
      callback(result);
      return;
    }
    var replyLevel = result.data.replyLevel + 1;

    internalAddPost(username, message, replyLevel, xssIt, hashtagParser, function (result) {
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

  })
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
var mongoose = require("mongoose");
var model = require(__dirname + '/model.js');
var Post = model.Post;
var User = model.User;
var Hashtag = model.Hashtag;
var async = require("async");

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
    post.picture = null;

    return post;
};

var internalAddPost = function (username, message, replyLevel, xssIt, hashtagsParser, callback) {
    if (username === "") {
        callback(createError("Username is required"));
        return;
    }

    if (message === "") {
        callback(createError("Message is required"));
        return;
    }

    var post = createPost(username, message, xssIt, hashtagsParser);
    post.replyLevel = replyLevel;

    Post
        .create(post,
            function (err, p) {
                if (err) {
                    callback(createError("Error adding post\n" + err));
                    return;
                }

                internalAddHashtags(hashtagsParser(message), function (err) {
                    if (err) {
                        callback(createError("Could not save hashtags.\n" + err));
                    }
                });

                callback(createSuccess(p));
            });
};

var createHashtag = function (hashtag) {
    var newTag = new Hashtag();
    newTag._id = hashtag.toLowerCase();
    newTag.id = hashtag.toLowerCase();
    newTag.label = hashtag.toLowerCase();
    newTag.value = hashtag.toLowerCase();
    return newTag;
};

var internalAddHashtags = function (hashtags, callback) {
    var i;
    async.each(hashtags,
        // 2nd parameter is the function that each item is passed into
        function (item, callback) {
            var dbtag = createHashtag(item);
            Hashtag
                .findOne({
                    _id: dbtag._id
                })
                .exec(function (err, tag) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    }

                    if (!tag) {
                        Hashtag.create(dbtag, function (err) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            }
                        });
                    }
                });
        },
        // 3rd parameter is the function call when everything is done
        function (err) {
            // All tasks are done now
            callback(err, null);
        });
};

var addPost = function (username, message, xssIt, hashtagsParser, callback) {
    internalAddPost(username, message, 0, xssIt, hashtagsParser, function (result) {
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

var getUser = function (id, next) {
    User
        .findById(id, function (err, user) {
            next(err, user);
        });
};

module.exports.getUser = getUser;

var createUser = function (user) {
    var regex = /(\w+).(\w+)@(\w+).(\w+)/i;
    var matches = regex.exec(user.email);
    var nick = matches[1] + matches[2];

    var dbUser = new User();
    dbUser.displayName = user.displayName;
    dbUser.email = user.email;
    dbUser.givenName = user.name.givenName;
    dbUser.familyName = user.name.familyName;
    dbUser.nickName = nick;
    dbUser._id = user.id;
    dbUser.picture = user.image.url;

    return dbUser;
};

var deserializeUser = function (id, next) {
    getUser(id, function (err, user) {
        next(err, user);
    });
};

module.exports.deserializeUser = deserializeUser;

var serializeUser = function (user, next) {
    var dbUser = createUser(user);

    getUser(dbUser._id, function (err, getUser) {
        if (err) {
            console.log('Error in getUser', err);
            next(err, null);
            return;
        }

        if (getUser) {
            getUser.displayName = user.displayName;
            getUser.email = user.email;
            getUser.givenName = user.name.givenName;
            getUser.familyName = user.name.familyName;
            getUser.picture = user.image.url;
            getUser
                .save(function (err, user) {
                    if (err) {
                        console.log('Error in getUser.update', err);
                        next(err, null);
                        return;
                    }
                    deserializeUser(user._id, function (err, user) {
                        next(err, user);
                        return;
                    });
                });
        } else {
            dbUser
                .save(function (err, user) {
                    if (err) {
                        console.log('Error in dbUser.save', err);
                        next(err, null);
                        return;
                    }
                    deserializeUser(user._id, function (err, user) {
                        next(err, user);
                    });
                });
        }
    });
};

module.exports.serializeUser = serializeUser;

var getAllUsers = function (next) {
    User
        .find({})
        .exec(function (err, users) {
            next(err, users);
        });
};

module.exports.getAllUsers = getAllUsers;

var getUserByNickName = function (nickName, next) {
    User
        .findOne({
            nickName: nickName
        }, function (err, user) {
            next(err, user);
        });
};

module.exports.getUserByNickName = getUserByNickName;


var getHashtagsStartingWith = function (prefix, callback) {
    var searchPattern = new RegExp("^" + prefix.toLowerCase() + ".*");
    console.log("searchPattern", searchPattern);
    Hashtag.find({
        _id: searchPattern
    }, callback);
};

module.exports.getHashtagsStartingWith = getHashtagsStartingWith;

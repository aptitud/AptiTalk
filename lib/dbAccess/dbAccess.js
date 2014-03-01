var mongoose = require("mongoose");
var model = require("./model.js");
var Hashtag = model.Hashtag;
var Reply = model.Reply;
var Post = model.Post;

var createSuccess = function (data) {
	return {
		success : true,
		errorMessage : "",
		data : data
	};
};

var createError = function (errorMessage) {
	return {
		success : false,
		errorMessage : errorMessage,
		data : null
	};
};

module.exports.connectToDb = function (connectionString) {
	if(mongoose.connection.readyState === 0) {// not open
		mongoose.connect(connectionString);
	}
};

module.exports.addPost = function (username, message, hashtagParser, callback) {
	if(username === "") {
		callback(createError("Username is required"));
		return;
	}

	if(message === "") {
		callback(createError("Message is required"));
		return;
	}

	var post = new Post();
	post.username = username;
	post.message = message;
	post.time = new Date();
	post.hashtags = hashtagParser(message);

	Post.create(post, function (err, p) {
		if(err){
			callback(createError("Error adding post\n" + err));
			return;
		}
		callback(createSuccess(p));
	});
};

var getPostById = function (id, callback) {
	Post
		.findOne({_id : id})
		.populate("replies")
		.exec(function (err, post) {
			if(err){
				callback(createError("Post '" + id + "' not found.\n" + err));
				return;
			}

			callback(createSuccess(post));
			return;
	});
};
module.exports.getPostById = getPostById;

module.exports.getPostsByHashTag = function (hashtag, callback) {
	Post
		.find({hashtags : hashtag})
		.populate("replies").
		exec(function (err, posts) {
			if(err){
				callback(createError("No posts found for hashtag '" + hashtag + "'"));
				return;
			}

			callback(createSuccess(posts));
			return;
	});
};

module.exports.getAllPosts = function (pageNumber, callback) {
	Post.find({})
		.populate("replies")
		.limit(10)
		.skip(pageNumber)
		.sort({time: -1})
		.exec(function (err, posts) {
			if(err){
				callback(createError("Error when getting all posts (page '" + pageNumber + "'\n" + err));
			}

			callback(createSuccess(posts));
		});
};

module.exports.addReply = function (id, username, message, callback) {

	if(username === "") {
		callback(createError("Username is required"));
		return;
	}

	if(message === "") {
		callback(createError("Message is required"));
		return;
	}

	var r = new Reply();
	r.parentPostId = id;
	r.username = username;
	r.message = message;
	r.time = new Date();

	Reply.create(r, function (err, reply) {
		if(err){
			callback(err);
			return;
		}

		getPostById(id, function (result) {
			var post = result.data;
			post.replies.push(reply);
			post.save(function (err) {
				if(err){
					callback(createError("Error updating post with reply\n" + err));
					return;
				}
				callback(createSuccess(reply));
			});
		});
	});
};

module.exports.getPostsForHashtag = function (hashtag, callback) {
	Post
	.find({hashtags : hashtag})
	.exec(function (err, posts) {
		if(err) {
			callback(createError("Error getting hashtag\n" + err));
			return;
		}

		callback(createSuccess({
			tag : hashtag,
			posts : posts
		}));
	});
};
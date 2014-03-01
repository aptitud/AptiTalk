var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var model = require("../../lib/dbAccess/model.js");
var Hashtag = model.Hashtag;
var Reply = model.Reply;
var Post = model.Post;

var USERNAME = "Marcus";
var MESSAGE = "Tjäääna!";

module.exports.USERNAME = USERNAME;
module.exports.MESSAGE = MESSAGE;

module.exports.connectMongo = function () {
	// TODO: Should use configuration object instead
	dbAccess.connectToDb("mongodb://localhost:27017/AptiTalk_Test");
};

module.exports.validateErrorResult = function (result, errorMessage) {
	should.exists(result);
	should.exists(result.success);
	result.success.should.equal(false);
	should.exists(result.errorMessage);
	result.errorMessage.should.startWith(errorMessage);
	should.not.exists(result.data);
};

var validateOkResult = function (result) {
	should.exists(result);
	should.exists(result.success);
	result.success.should.equal(true);
	should.exists(result.errorMessage);
	result.errorMessage.should.be.empty;
	should.exists(result.data);
};
module.exports.validateOkResult = validateOkResult;

module.exports.deleteAll = function () {
	Post.remove({}, function (err) {
		if(err) console.log(err);
	});
	Reply.remove({}, function (err) {
		if(err) console.log(err);
	});
};

var addTestPost = function (username, message, cb) {
	dbAccess.addPost(username, message, getHashTagsFromMessage, function (result) {
		validateOkResult(result);
		cb(result);
	});
};
module.exports.addTestPost = addTestPost;

module.exports.addTestPosts = function (numberOfPosts, callback) {
	for (var i = 0; i <= numberOfPosts; i++) {
		addTestPost(USERNAME, MESSAGE + " " + (i + 1), callback);
	}
};

var getHashTagsFromMessage = function (message) {
	var hashs = [];

	var words = message.split(" ");
	for (var i = 0; i < words.length; i++) {
		if(words[i][0] === "#"){
			hashs.push(words[i]);
		}
	}

	return hashs;
};
module.exports.getHashTagsFromMessage = getHashTagsFromMessage;

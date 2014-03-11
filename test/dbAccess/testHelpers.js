var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var model = require("../../lib/dbAccess/model.js");
var config = require("../../config")("test");
var Post = model.Post;
var User = model.User;

var USERNAME = "Marcus";
var MESSAGE = "Tjäääna!";

module.exports.USERNAME = USERNAME;
module.exports.MESSAGE = MESSAGE;

module.exports.connectMongo = function () {
  dbAccess.connectToDb(config.mongoUrl);
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

var fakeXssIt = function (message) {
  return message;
};
module.exports.fakeXssIt = fakeXssIt;


module.exports.deleteAll = function () {
  Post.remove({}, function (err) {
    if (err) {
      console.log("Couldn't delete all documents\n" + err);
    }
  });
  User.remove({}, function (err) {
    if (err) {
      console.log("Couldn't delete all users\n" + err);
    }
  });
};

var getHashTagsFromMessage = function (message) {
  var hashs = [];
  var i = 0;
  var words = message.split(" ");
  for (i = 0; i < words.length; i++) {
    if (words[i][0] === "#") {
      if (hashs.indexOf(words[i]) === -1) {
        hashs.push(words[i]);
      }
    }
  }
  return hashs;
};
module.exports.getHashTagsFromMessage = getHashTagsFromMessage;

var addTestPost = function (username, message, cb) {
  dbAccess.addPost(username, message, fakeXssIt, getHashTagsFromMessage, function (result) {
    validateOkResult(result);
    cb(result);
  });
};
module.exports.addTestPost = addTestPost;

var addTestReply = function (id, username, message, cb) {
  dbAccess.addReply(id, username, message, fakeXssIt, getHashTagsFromMessage, function (result) {
    cb(result);
  });
};
module.exports.addTestReply = addTestReply;

module.exports.addTestPosts = function (numberOfPosts, callback) {
  var i = 0;
  for (i = 0; i <= numberOfPosts; i++) {
    addTestPost(USERNAME, MESSAGE + " " + (i + 1), callback);
  }
};
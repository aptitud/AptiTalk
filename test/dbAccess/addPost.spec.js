var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Adding posts", function () {

  before(function (done) {
    testHelpers.connectMongo();
    done();
  });

  beforeEach(function (done) {
    testHelpers.deleteAll();
    done();
  });

  after(function (done) {
    testHelpers.deleteAll();
    done();
  });

  it("adds a correctly formatted new message", function (done) {
    dbAccess
      .addPost(testHelpers.USERNAME, testHelpers.MESSAGE, testHelpers.getHashTagsFromMessage, function (result) {
        testHelpers.validateOkResult(result);
        should.exists(result.data._id);
        result.data.username.should.be.equal(testHelpers.USERNAME);
        result.data.message.should.be.equal(testHelpers.MESSAGE);
        done();
      });
  });
  it("calls my callback function with the error when an error occurs", function (done) {
    dbAccess.addPost("", "", testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateErrorResult(result, "");
      done();
    });
  });
  it("validates the prescense of an user name", function (done) {
    dbAccess.addPost("", testHelpers.MESSAGE, testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateErrorResult(result, "Username");
      done();
    });
  });
  it("validates the prescense of a message", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, "", testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateErrorResult(result, "Message");
      done();
    });
  });
  it("adds the posted date", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, testHelpers.MESSAGE, testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      should.exists(result.data.time);
      done();
    });
  });
  it("creates the post with no replies", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, testHelpers.MESSAGE, testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      result.data.replies.should.be.emtpy;
      done();
    });
  });
  it("creates an empty hashtag list for no hashtags", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, testHelpers.MESSAGE, testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      result.data.hashtags.should.be.emtpy;
      done();
    });
  });
  it("creates an array with 1 hashtag for 1 hashtag in the message", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, "a #hash tag", testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      should.exists(result.data.hashtags);
      result.data.hashtags.should.not.be.emtpy;
      result.data.hashtags[0].should.equal("#hash");
      done();
    });
  });
  it("creates an array with 2 hashtag for 2 hashtag in the message", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, "and now #two #hash tags", testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      should.exists(result.data.hashtags);
      result.data.hashtags.should.not.be.emtpy;
      result.data.hashtags[0].should.equal("#two");
      result.data.hashtags[1].should.equal("#hash");
      done();
    });
  });
  it("creates an array with 1 hashtag for 2 or more of the same hashtags in the message", function (done) {
    dbAccess.addPost(testHelpers.USERNAME, "and now 3 of the #samehash #samehash #samehash tags", testHelpers.getHashTagsFromMessage, function (result) {
      testHelpers.validateOkResult(result);
      should.exists(result.data.hashtags);
      result.data.hashtags.length.should.equal(1);
      result.data.hashtags[0].should.equal("#samehash");
      done();
    });
  });
});
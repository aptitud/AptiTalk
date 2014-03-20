var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Replying to posts", function () {

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

  function validateNumberOfReplies(id, expectedNumberOfReplies) {
    dbAccess.getPostById(id, function (result) {
      testHelpers.validateOkResult(result);
      result.data.replies.length.should.equal(expectedNumberOfReplies);
    });
  }

  function validateNumberOfHashtagsOfReply(id, expectedNumberOfHashtags) {
    dbAccess.getPostById(id, function (result) {
      testHelpers.validateOkResult(result);
      result.data.replies.length.should.equal(1);
      result.data.replies[0].hashtags.length.should.equal(expectedNumberOfReplies);
    });
  }


  it("adds replies to a post", function (done) {
    testHelpers.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
      var id = result.data._id;
      testHelpers.addTestReply(id, "Hugo", "Tjääääna du'ra!", function (result) {
        testHelpers.addTestReply(id, "Marcus", "Asså ba tjena!", function (result) {
          testHelpers.validateOkResult(result);
          result.data.replyLevel.should.equal(1);
          validateNumberOfReplies(id, 2);
          done();
        });
      });
    });
  });

  it("adds replies to a reply (threaded replies)", function (done) {
    testHelpers.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
      var id = result.data._id;
      result.data.replyLevel.should.equal(0);
      testHelpers.addTestReply(id, "Hugo", "Tjääääna du'ra!", function (result) {
        var replyId = result.data._id;
        result.data.replyLevel.should.equal(1);
        testHelpers.addTestReply(replyId, "Marcus", "Asså ba tjena!", function (result) {
          testHelpers.validateOkResult(result);
          result.data.replyLevel.should.equal(2);
          validateNumberOfReplies(id, 1);
          validateNumberOfReplies(replyId, 1);
          done();
        });
      });
    });
  });

  it("validates the presence of username", function (done) {
    testHelpers.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
      var id = result.data._id;
      testHelpers.addTestReply(id, "", "Tjääääna du'ra!", function (result) {
        testHelpers.validateErrorResult(result, "Username");
        done();
      });
    });
  });
  it("validates the presence of a message", function (done) {
    testHelpers.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
      var id = result.data._id;
      testHelpers.addTestReply(id, "Hugo", "", function (result) {
        testHelpers.validateErrorResult(result, "Message");
        done();
      });
    });
  });
});
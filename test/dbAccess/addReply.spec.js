var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Replying to posts", function () {

    before(function (done) {
        testHelpers.connectMongo();
        testHelpers.deleteAll();
        done();
    });

    after(function (done) {
      testHelpers.deleteAll();
      done();
    });

    function validateNumberOfReplies(id, expectedNumberOfReplies) {
        // console.log("Getting " + id + " back out");
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
        testHelpers.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result1) {
            var id = result1.data._id;
            testHelpers.addTestReply(id, "Hugo", "Answer 1 for: " + id, function (result2) {
                testHelpers.addTestReply(id, "Marcus", "Answer 2 for: " + id, function (result3) {

                    testHelpers.validateOkResult(result3);
                    result3.data.replyLevel.should.equal(1);

                    validateNumberOfReplies(id, 2);
                    
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

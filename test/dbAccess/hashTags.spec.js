var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Hashtags", function () {
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

  describe("getting posts for hashtag", function () {
    it("returns the posts for the hashtag with one post", function (done) {
      testHelpers.addTestPost(testHelpers.USERNAME, "#tjäääääna var det då", function (result) {
        dbAccess.getPostsForHashtag("#tjäääääna", function (result) {
          testHelpers.validateOkResult(result);
          result.data.posts.length.should.equal(1);
          result.data.tag.should.equal("#tjäääääna");
          done();
        });
      });
    });
    it("returns the posts for the hashtag with two post", function (done) {
      testHelpers.addTestPost(testHelpers.USERNAME, "#tjäääääna var det då", function (result) {
        testHelpers.addTestPost(testHelpers.USERNAME, "#tjäääääna var det igen", function (result) {
          dbAccess.getPostsForHashtag("#tjäääääna", function (result) {
            testHelpers.validateOkResult(result);
            result.data.posts.length.should.equal(2);
            result.data.tag.should.equal("#tjäääääna");
            done();
          });
        });
      });
    });
    it("returns 0 for non-existing tag", function (done) {
      dbAccess.getPostsForHashtag("#tjäääääna", function (result) {
        testHelpers.validateOkResult(result);
        result.data.posts.length.should.equal(0);
        result.data.tag.should.equal("#tjäääääna");
        done();
      });
    });
  });
});
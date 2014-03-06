var should = require('should');
var chat = require('../lib/chat.js');
var testHelpers = require("./dbAccess/testHelpers.js");

describe('All bugs', function () {

  before(function (done) {
    testHelpers.connectMongo();
    done();
  });

  after(function (done) {
    testHelpers.deleteAll();
    done();
  });

  describe('Bug #14', function () {

    it('A post that starts with a tag should parse the tag', function (done) {
      var message = '#aptitalk is the best';
      var user = 'hugo';
      chat.createPost(user, message, function (post) {
        post.hashtags.length.should.equal(1);
        post.hashtags[0].should.equal('aptitalk');
        done();
      });
    });

    it('A reply that starts with a tag should parse the tag', function (done) {
      var message = '#aptitalk is the best';
      var user = 'hugo';
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, message, function (reply) {
          reply.hashtags.length.should.equal(1);
          post.hashtags[0].should.equal('aptitalk');
          done();
        });
      });
    });

  });

});
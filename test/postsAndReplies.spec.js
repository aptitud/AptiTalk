var should = require('should');
var chat = require('../lib/chat.js');
var testHelpers = require("./dbAccess/testHelpers.js");


describe('Posts and replies', function () {
  before(function (done) {
      testHelpers.connectMongo();
      done();
  });

  after(function (done) {
    testHelpers.deleteAll();
    done();
  });

  describe('When a user posts a simple message', function () {
    var user = 'hugo';
    var message = 'Hello World! Hallå Världen!';

    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    it('the post should have an id', function (done) {
      chat.createPost(user, message, function (post) {
        post.should.have.property('_id');
        done();
      });
    });
    it('the post should have the correct message', function (done) {
      chat.createPost(user, message, function (post) {
        post.message.should.equal(message);
        done();
      });
    });
    it('the post should have no replies', function (done) {
      chat.createPost(user, message, function (post) {
        post.replies.length.should.equal(0);
        done();
      });
    });
    it('the post should have no hashtags', function (done) {
      chat.createPost(user, message, function (post) {
        post.hashtags.length.should.equal(0);
        done();
      });
    });
  });

  describe('When a user replies to a post', function () {
    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    var user = { name : 'hugo'};
    var message = 'Hello World! Hallå Världen!';
    var replyMessage = 'Svar på öööh';

    it('the reply should have an id', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage, function (reply) {
          reply.should.have.property('_id');
          done();
        });
      });
    });
    it('the reply should have the correct user', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage, function (reply) {
          reply.username.should.equal(user.name);
          done();
        });
      });
    });
    it('the reply should have the correct message', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage,  function (reply) {
          reply.message.should.equal(replyMessage);
          done();
        });
      });
    });
    it('the reply should have no replies', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage, function (reply) {
          reply.replies.length.should.equal(0);
          done();
        });
      });
    });
    it('the reply should have no hashtags', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage, function (reply) {
          reply.hashtags.length.should.equal(0);
          done();
        });
      });
    });
    it('the post should have a reference to the reply', function (done) {
      chat.createPost(user, message, function (post) {
        chat.replyPost(post._id, user, replyMessage, function (reply) {
          chat.getPost(post._id, function (postFromDb) {
            postFromDb.replies.length.should.equal(1);
            postFromDb.replies[0]._id.should.eql(reply._id);
            done();
          });
        });
      });
    });
  });

  describe('When AptiTalk stores a post', function () {
    var user = { name : 'hugo'};
    var message = 'Hello World! Hallå Världen!';

    it('the post should be accessible from the post._id', function (done) {
      chat.createPost(user, message, function (post) {
        chat.getPost(post._id, function (postFromDb) {
          should.exists(postFromDb);
          postFromDb.username.should.equal(user.name);
          done();
        });
      });
    });
  });
});
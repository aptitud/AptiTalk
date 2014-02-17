var should = require('should');
var chat = require('../lib/chat.js');

describe('Posts and replies', function () {
  describe('When a user posts a simple message', function () {
    var id = 1974;
    var user = 'hugo';
    var message = 'Hello World! Hallå Världen!';
    var post = chat.createPost(id, user, message);
    it('the post should have the correct id', function (done) {
      post.id.should.equal(id);
      done();
    });
    it('the post should have the correct user', function (done) {
      post.user.should.equal(user);
      done();
    });
    it('the post should have the correct message', function (done) {
      post.message.should.equal(message);
      done();
    });
    it('the post should have no replies', function (done) {
      post.replies.length.should.equal(0);
      done();
    });
    it('the post should have no hashtags', function (done) {
      post.hashtags.length.should.equal(0);
      done();
    });
  });

  describe('When a user replies to a post', function () {
    var id = 1974;
    var user = 'hugo';
    var message = 'Hello World! Hallå Världen!';
    var replyMessage = 'Svar på öööh';
    var post = chat.createPost(id, user, message);
    var reply = chat.replyPost(post, user, replyMessage);
    it('the reply should have the correct id', function (done) {
      reply.id.should.equal(0);
      done();
    });
    it('the reply should have the correct user', function (done) {
      reply.user.should.equal(user);
      done();
    });
    it('the reply should have the correct message', function (done) {
      reply.message.should.equal(replyMessage);
      done();
    });
    it('the reply should have no replies', function (done) {
      reply.replies.length.should.equal(0);
      done();
    });
    it('the reply should have no hashtags', function (done) {
      reply.hashtags.length.should.equal(0);
      done();
    });
    it('the post should have a reference to the reply', function (done) {
      post.replies.length.should.equal(1);
      done();
    });
  });

  describe('When AptiTalk stores a post', function () {
    var id = 1974;
    var user = 'hugo';
    var message = 'Hello World! Hallå Världen!';
    var post = chat.createPost(id, user, message);
    chat.storePost(post);
    it('the post should be stored', function (done) {
      chat.getPosts().length.should.equal(1);
      done();
    });
  });
});
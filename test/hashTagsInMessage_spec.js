var should = require('should');
var hashTagParser = require('../lib/hashtagparser.js');
var chat = require('../lib/chat.js');
var testHelpers = require("./dbAccess/testHelpers.js");

describe('Hashtags in posts or replies', function () {
  before(function (done) {
    testHelpers.connectMongo();
    done();
  });

  after(function (done) {
    testHelpers.deleteAll();
    done();
  });

  describe('When a user posts a message containing a hashtag', function () {
    it('the hashtag should be clickable in message', function (done) {
      var hashtag = 'this #aptitalk is the best';
      var message = hashTagParser.toStaticHTML(hashtag);
      message.should.equal('this<a href=\"/hashtags/aptitalk\" target=\"_blank\"> #aptitalk</a> is the best');
      done();
    });
  });

  describe('When a user posts a message starting with a hashtag', function () {
    it('the hashtag should be clickable in message', function (done) {
      var hashtag = '#aptitålk is the best';
      var message = hashTagParser.toStaticHTML(hashtag);
      message.should.equal('<a href=\"/hashtags/aptitålk\" target=\"_blank\">#aptitålk</a> is the best');
      done();
    });
  });

  describe('When a user posts a message containing a hashtag with swedish letters', function () {
    it('the hashtag should be clickable in message', function (done) {
      var hashtag = 'denna #aptitalk #äÄr #öÖverlägsen #påÅ';
      var message = hashTagParser.toStaticHTML(hashtag);
      message.should.equal('denna<a href=\"/hashtags/aptitalk\" target=\"_blank\"> #aptitalk</a><a href=\"/hashtags/äÄr\" target=\"_blank\"> #äÄr</a><a href=\"/hashtags/öÖverlägsen\" target=\"_blank\"> #öÖverlägsen</a><a href=\"/hashtags/påÅ\" target=\"_blank\"> #påÅ</a>');
      done();
    });
  });

  describe('When a user posts a message containing a hashtag', function () {
    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    it('the post should have the hashtag in the datastructure', function (done) {
      var message = 'this #aptitalk is the best';
      var user = 'hugo';
      chat.createPost(user, message, function (post) {
        post.hashtags.length.should.equal(1);
        post.hashtags[0].should.equal('aptitalk');
        done();
      });
    });
  });

  describe('When a user posts a message containing several hashtags', function () {
    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    it('the post should have the hashtag in the datastructure', function (done) {
      var message = 'this #aptitalk is the #best';
      var user = 'hugo';
      chat.createPost(user, message, function (post) {
        post.hashtags.length.should.equal(2);
        post.hashtags[0].should.equal('aptitalk');
        post.hashtags[1].should.equal('best');
        done();
      });
    });
  });

  describe('When a user posts a message containing 3 of the same hashtags', function () {
    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    it('the post should have 1 hashtag in the datastructure', function (done) {
      var message = 'this #aptitalk #aptitalk #aptitalk is the #best';
      var user = 'hugo';
      chat.createPost(user, message, function (post) {
        post.hashtags.length.should.equal(2);
        post.hashtags[0].should.equal('aptitalk');
        post.hashtags[1].should.equal('best');
        done();
      });
    });
  });

  describe('When a user posts a message containing hashtags', function () {
    beforeEach(function (done) {
      testHelpers.deleteAll();
      done();
    });

    it("adds and retrieves hashtags", function (done) {
      chat.createPost('hugo', 'I think #aptitalk rocks', function (post) {
        chat.createPost('marcus', 'I think #aptitalk rocks indeeed', function (post) {
          chat.getPostsForHashtag('aptitalk', function (posts) {
            posts.length.should.be.equal(2);
            done();
          });
        });
      });
    });
  });
});
var should = require('should');
var hashTagParser = require('../lib/hashtagparser.js');
var chat = require('../lib/chat.js');

describe('Hashtags in posts or replies', function () {
  describe('When a user posts a message containing a hashtag', function () {
    it('the hashtag should be clickable in message', function (done) {
      var hashtag = 'this #aptitalk is the best';
      var message = hashTagParser.toStaticHTML(hashtag);
      message.should.equal('this<a href=\"/hashtags/aptitalk\" target=\"_blank\"> #aptitalk</a> is the best');
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
    it('the post should have the hashtag in the datastructure', function (done) {
      var hashtag = 'this #aptitalk is the best';
      var post = chat.createPost(0, 'hugo', hashtag);
      post.hashtags[0].should.equal('aptitalk');
      done();
    });
  });

  describe('When a user posts a message containing several hashtags', function () {
    it('the post should have several hashtags in the datastructure', function (done) {
      var hashtag = 'this #aptitalk is the #best';
      var post = chat.createPost(0, 'hugo', hashtag);
      post.hashtags[0].should.equal('aptitalk');
      post.hashtags[1].should.equal('best');
      done();
    });
  });

  describe('When a user posts a message containing hashtags', function () {
    it('the hashtags should be stored for easy searching', function (done) {
      var hashtag = 'this #aptitalk is the #best';
      chat.createPost(0, 'hugo', hashtag);
      chat.createPost(1, 'marcus', hashtag);
      var tag = chat.getHashTag('aptitalk');
      tag.name.should.equal('aptitalk');
      tag.posts.length.should.be.greaterThan(0);
      tag = chat.getHashTag('best');
      tag.name.should.equal('best');
      tag.posts.length.should.be.greaterThan(0);
      done();
    });
  });
});
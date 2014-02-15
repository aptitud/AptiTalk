var should = require('should');
var hashTagParser = require('../lib/hashtagparser.js');
var chat = require('../lib/chat.js');

describe('Hashtags in posts or replies', function () {
  describe('When a user posts a message containing a hashtag', function () {
    it('the hashtag should be clickable in message', function (done) {
      var hashtag = 'this #aptitalk is the best';
      var message = hashTagParser.toStaticHTML(hashtag);
      message.should.equal('this<a href=\"/hashtags/#aptitalk\" target=\"_blank\"> #aptitalk</a> is the best');
      done();
    });
  });

  describe('When a user posts a message containing a hashtag', function () {
    it('the post should have the hashtag in the datastructure', function (done) {
      var hashtag = 'this #aptitalk is the best';
      var post = chat.createPost(0, 'hugo', hashtag);
      post.hashTags[0].should.equal('#aptitalk');
      done();      
    });
  });

  describe('When a user posts a message containing several hashtags', function () {
    it('the post should several hashtags in the datastructure', function (done) {
      var hashtag = 'this #aptitalk is the #best';
      var post = chat.createPost(0, 'hugo', hashtag);
      post.hashTags[0].should.equal('#aptitalk');
      post.hashTags[1].should.equal('#best');
      done();      
    });
  });
});
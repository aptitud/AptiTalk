var should = require('should');
var linkParser = require('../lib/linkParser.js');

describe('Links in posts or replies', function () {
  describe('When a user posts a message containing a link', function () {
    it('the link should be clickable in message', function (done) {
      var link = 'http://www.aptitud.se';
      var message = linkParser.toStaticHTML(link);
      message.should.equal('<a href="' + link + '" target=\"_blank\">' + link + '</a>');
      done();
    });
  });
  describe('When a user posts a message containing multiple links', function () {
    it('the links should all be clickable in message', function (done) {
      var link = 'http://www.aptitud.se';
      var link2 = 'http://www.hugohaggmark.com';
      var complete = link + '\n' + link2;
      var message = linkParser.toStaticHTML(complete);
      message.should.equal('<a href="' + link + '" target=\"_blank\">' + link + '</a>\n' + '<a href="' + link2 + '" target=\"_blank\">' + link2 + '</a>');
      done();
    });
  });
});
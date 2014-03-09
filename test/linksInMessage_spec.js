var should = require('should');
var linkParser = require('../lib/linkparser.js');

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

  describe('When a user posts a message containing a link to an image', function () {
    it('the image should show up in the message', function (done) {
      var link = 'http://aptitud.se/images/aptitudlogo.png';
      var message = linkParser.toStaticHTML(link);
      message.should.equal('<a href=\"' + link + '\" target=\"_blank\"><img class=\"img-message\" src=\"' + link + '\"></a>');
      done();
    });
  });

  describe('When a user posts a message containing a link to multiple images', function () {
    it('the images should show up in the message', function (done) {
      var link = 'http://a.gifb.in/1047444azmp81le1x.gif';
      var link2 = 'http://a.gifb.in/082009/1251191958_naked_gun_leslie_nielsen.gif';
      var message = linkParser.toStaticHTML(link + ' ' + link2);
      message.should.equal('<a href=\"' + link + '\" target=\"_blank\"><img class=\"img-message\" src=\"' + link + '\"></a> <a href=\"' + link2 + '\" target=\"_blank\"><img class=\"img-message\" src=\"' + link2 + '\"></a>');
      done();
    });
  });

  describe('When a user posts a message containing links, text and images', function () {
    it('the links and images should all be clickable in message and the text in the message should be intact', function (done) {
      var link = 'http://www.aptitud.se';
      var link2 = 'http://a.gifb.in/1047444azmp81le1x.gif';
      var complete = 'this is a link:' + link + ' and this is a image:' + link2 + ' and text after should be intact too.';
      var message = linkParser.toStaticHTML(complete);
      message.should.equal('this is a link:<a href="' + link + '" target=\"_blank\">' + link + '</a> and this is a image:<a href=\"' + link2 + '\" target=\"_blank\"><img class=\"img-message\" src=\"' + link2 + '\"></a> and text after should be intact too.');
      done();
    });
  });

});
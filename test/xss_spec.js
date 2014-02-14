var should = require('should');
var xss = require('../lib/xss.js');

describe('XSSPrevention', function () {
  describe('When a hacker tries to inject a xss component', function () {
    it('Aptitalk should url encode xss component', function (done) {
      var urlEncodedString = xss.XSS.toStaticHTML('<script>alert()</script>');
      urlEncodedString.should.equal('&lt;script>alert()&lt;/script>');
      done();
    });
  });
});
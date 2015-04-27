var hashTagParser = hashTagParser || {};
var hashTagPattern = /(^|\s|)#([åäöÅÄÖ\w]+)/ig;

exports.pattern = function () {
  return hashTagPattern;
};

exports.toStaticHTML = function (message) {
  return message.replace(hashTagPattern, '<a href=\"/hashtags/$2\">$1#$2</a>');
};

exports.getHashTags = function (message) {
  var tags = [];
  var m;
  while ((m = hashTagPattern.exec(message)) !== null) {
    if (tags.indexOf(m[2]) === -1) {
      tags.push(m[2]);
    }
  }
  return tags;
};

var hashTagParser = hashTagParser || {};
var hashTagPattern = /(^|\s)(#(\w|[åÅäÄöÖ])+)/ig;

exports.toStaticHTML = function (message) {
  var regEx = new RegExp(hashTagPattern);
  return message.replace(hashTagPattern, '<a href=\"/hashtags/$2\" target=\"_blank\">$1$2</a>');
};

exports.getHashTags = function (message) {
  var tags = [];
  var m;
  while ((m = hashTagPattern.exec(message)) !== null)
  {
    tags.push(m[2]);
  }
  return tags;
};
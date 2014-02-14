var linkParser = linkParser || {};

exports.toStaticHTML = function (message) {
  var exp = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
  return message.replace(exp, "<a href=\"$1\" target=\"_blank\">$1</a>");
};
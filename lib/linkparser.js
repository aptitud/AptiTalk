var linkParser = linkParser || {};

exports.toStaticHTML = function (message) {
  var linkPattern = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
  var m;
  var link = '';
  var index = 0;
  while ((m = linkPattern.exec(message)) !== null) {
    link = link + message.substring(index, m.index);
    index = linkPattern.lastIndex;
    if (isImageLink(m[0])) {
      link = link + '<a href=\"' + m[0] + '\" target=\"_blank\"><img class=\"img-message\" src=\"' + m[0] + '\"></a>';
    } else {
      link = link + '<a href=\"' + m[0] + '\" target=\"_blank\">' + m[0] + '</a>';
    }
  }
  return link;
};

function isImageLink(val) {
  var imagePattern = /(https?:\/\/.*\.(png|jpe?g|gif))/ig;
  var regEx = new RegExp(imagePattern);
  if (regEx.test(val)) {
    return true;
  }
  return false;
}
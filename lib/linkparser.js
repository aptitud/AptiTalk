var linkParser = linkParser || {};

exports.toStaticHTML = function (message) {
  if (hasLinks(message) === false) {
    return message;
  }
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
  if(index <= message.length){
    link = link + message.substring(index, message.length);
  }
  return link;
};

function isMatch(val, pattern) {
  var regEx = new RegExp(pattern);
  if (regEx.test(val)) {
    return true;
  }
  return false;
}

function hasLinks(val) {
  var linkPattern = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
  return isMatch(val, linkPattern);
}

function isImageLink(val) {
  var imagePattern = /(https?:\/\/.*\.(png|jpe?g|gif))/ig;
  return isMatch(val, imagePattern);
}
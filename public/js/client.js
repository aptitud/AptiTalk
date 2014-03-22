var io;
var socket = io.connect();
var liEndTag = "</li>";
var baseReplyHtml = "<div class=\"input-group input-group-sm\"><textarea id=\"reply-input-{0}\" type=\"text\" class=\"form-control reply-input\"></textarea><span class=\"input-group-btn\"><button id=\"reply-btn-{0}\" class=\"btn btn-info btn-xs\" type=\"button\">Reply</button></span></div>";
var baseHtml = "<li class=\"list-group-item list-group-item{4}\"><div id=\"{5}-{0}\"><div id=\"post-image\"><img src=\"img/noprofile.jpg\" id=\"img-post\"></div><div id=\"post-user\">{1}</div><time id=\"post-time\" datetime=\"{2}\"></time><div id=\"post-message\">{3}</div>";
var postHtml = baseHtml + baseReplyHtml + liEndTag;
var replyHtml = baseHtml + liEndTag;
var postsList = $(posts);
var thePosts = [];
var theUser = [];

if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    var re = /\{(\d+)\}/g;
    return this.replace(re, function (match, number) {
      return args[number] !== 'undefined' ? args[number] : match;
    });
  };
}

function createReply(postId, reply) {
  console.log('CLIENT - createReply', reply);
  console.log('CLIENT - createReply postId', postId);
  var r = replyHtml.format(reply._id, reply.username, reply.time, reply.message, '-reply', 'reply');
  $('#post-' + postId).closest('li').after(r);
}

function createPost(post) {
  console.log('CLIENT - createPost', post);
  var p = postHtml.format(post._id, post.username, post.time, post.message, '', 'post');
  postsList.prepend(p);
}

function initButtonEvents() {
  $('.btn-primary').click(function (event) {
    var message = $('#input-primary').val();
    if (message !== '') {
      var post = {
        postId: 0,
        user: theUser.name,
        message: message
      };
      socket.emit('post', post);
      $('#input-primary').val('');
    }
  });

  $(".btn-info").click(function (event) {
    var id = event.target.id.replace(/reply-btn-/g, '');
    var message = $('#reply-input-' + id).val();
    if (message !== '') {
      var reply = {
        postId: id,
        user: theUser.name,
        message: message
      };
      $('#reply-input-' + id).val('');
      socket.emit('reply', reply);
    }
  });

  $(".reply-input").keyup(function (event) {
    var btnId = "#reply-btn-" + event.target.id.replace(/reply-input-/g, '');
    if (event.keyCode === 13 && event.shiftKey) {
      return;
    }
    if (event.keyCode === 13) {
      $(btnId).click();
    }
  });

  $('#input-primary').keyup(function (event) {
    if (event.keyCode === 13 && event.shiftKey) {
      return;
    }

    if (event.keyCode === 13) {
      $('.btn-primary').click();
    }
  });
}

//Init
$(function () {
  theUser = {
    id: $('#userId').text(),
    name: $('#userName').text(),
    email: $('#userEmail').text(),
    picture: $('#img-profile-heading').attr('src')
  };
  initButtonEvents();
  $('#input-primary').focus();
  $('time').timeago();
});

socket.on('connect', function () {
  console.log('CLIENT - Connected');
});

socket.on('replyAdded', function (postId, replyAdded) {
  createReply(postId, replyAdded);
  initButtonEvents();
  $('time').timeago();
});

socket.on('postAdded', function (postAdded) {
  createPost(postAdded);
  initButtonEvents();
  $('time').timeago();
});

socket.on('sessionId', function (socketId) {
  socket.emit('user', theUser, socketId);
});
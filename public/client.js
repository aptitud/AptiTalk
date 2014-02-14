var io;
var socket = io.connect();
var liEndTag = "</li>";
var baseReplyHtml = "<div class=\"input-group input-group-sm\"><textarea id=\"reply-input-{0}\" type=\"text\" class=\"form-control reply-input\"></textarea><span class=\"input-group-btn\"><button id=\"reply-btn-{0}\" class=\"btn btn-info btn-xs\" type=\"button\">Reply</button></span></div>";
var baseHtml = "<li class=\"list-group-item list-group-item{4}\"><div id=\"{5}-{0}\"><div id=\"post-image\"><img src=\"noprofile.jpg\" id=\"img-post\"></div><div id=\"post-user\">{1}</div><time id=\"post-time\" datetime=\"{2}\"></time><div id=\"post-message\">{3}</div>";
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
  var r = replyHtml.format(reply.id, reply.user.name, reply.date, reply.message, '-reply', 'reply');
  $('#post-' + postId).closest('li').after(r);
}

function createPost(post) {
  var p = postHtml.format(post.id, post.user.name, post.date, post.message, '', 'post');
  postsList.prepend(p);

  $(".btn-info").click(function (event) {
    var id = event.target.id.replace(/reply-btn-/g, '');
    var message = $('#reply-input-' + id).val();
    if (message !== '') {
      var reply = {
        postId: id,
        user: theUser,
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
}

//Init
$(function () {
  $('.btn-primary').click(function (event) {
    var message = $('#input-primary').val();
    if (message !== '') {
      var post = {
        postId: 0,
        user: theUser,
        message: message
      };
      socket.emit('post', post);
      $('#input-primary').val('');
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
  theUser = {id: $('#userId').text(), name: $('#userName').text(), email: $('#userEmail').text()};
  $('#input-primary').focus();
});

socket.on('connect', function () {
  console.log('connected');
  postsList.empty();
  socket.emit('getPosts');
});

socket.on('loadPosts', function (posts) {
  thePosts = posts;
  $.each(posts, function (index, post) {
    createPost(post);
    $.each(post.replies.reverse(), function (index, reply) {
      createReply(post.id, reply);
    });
  });

  $('time').timeago();
});

socket.on('replyAdded', function (postId, replyAdded) {
  createReply(postId, replyAdded);
  $('time').timeago();
});

socket.on('postAdded', function (postAdded) {
  createPost(postAdded);
  $('time').timeago();
});
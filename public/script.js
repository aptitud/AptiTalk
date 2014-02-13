var messageContainer, submitButton, pseudoSubmit, replySubmit, replyInput;
var pseudo = "";
var replyId;
var io;

//Socket.io
var socket = io.connect();

function time() {
  $("time").each(function () {
    $(this).text($.timeago($(this).attr('title')));
  });
}

function addMessage(id, msg, pseudo, date, self) {
  var dude = pseudo;
  var classDiv = "row message";
  if (self) {
    classDiv = "row message self";
    dude = "Me";
  }

  $("#chatEntries").append('<div class="' + classDiv + '" id="Post_' + id + '"><p class="infos"><span class="pseudo">' + dude + '</span>, <time class="date" title="' + date + '">' + date + '</time></p><p>' + msg + '</p><div id="RepliesFor_' + id + '"></div><button class="btn-mini" id="Reply_' + id + '">Reply</button></div>');
  time();

  $('#Reply_' + id).click(function () {
    replyId = id;
    $('#modalReply').modal('show');
  });
}

function setHeight() {
  $(".slimScrollDiv").height('403');
  $(".slimScrollDiv").css('overflow', 'visible');
}

//Help functions
function sentMessage() {
  if (messageContainer.val() !== "") {
    if (pseudo === "") {
      $('#modalPseudo').modal('show');
    } else {
      socket.emit('message', messageContainer.val());
      messageContainer.val('');
      submitButton.button('loading');
    }
  }
}

function replyPost() {
  if (replyInput.val() !== "") {
    var reply = {
      id: replyId,
      pseudo: pseudo,
      message: replyInput.val()
    };
    console.log(reply);
    socket.emit('reply', reply);
    replyInput.val('');
    $('#modalReply').modal('hide');
  }
}

function bindButton() {
  submitButton.button('loading');
  messageContainer.on('input', function () {
    if (messageContainer.val() === "") {
      submitButton.button('loading');
    } else {
      submitButton.button('reset');
    }
  });
}

function setPseudo() {
  if ($("#pseudoInput").val() !== "") {
    socket.emit('setPseudo', $("#pseudoInput").val());
    socket.on('pseudoStatus', function (data) {
      if (data === "ok") {
        $('#modalPseudo').modal('hide');
        $("#alertPseudo").hide();
        pseudo = $("#pseudoInput").val();
      } else {
        $("#alertPseudo").slideDown();
      }
    });
  }
}

// Init
$(function () {
  messageContainer = $('#messageInput');
  submitButton = $("#submit");
  pseudoSubmit = $('#pseudoSubmit');
  replySubmit = $('#replySubmit');
  replyInput = $('#replyInput');
  bindButton();
  window.setInterval(time, 1000 * 10);
  $("#alertPseudo").hide();
  $('#modalPseudo').modal('hide');
  $("#chatEntries").slimScroll({
    height: '400px'
  });
  pseudoSubmit.click(function () {
    setPseudo();
  });
  replySubmit.click(function () {
    replyPost();
  });
  submitButton.click(function () {
    sentMessage();
  });
  $('input').keypress(function (event) {
    if (event.keyCode === $.ui.keyCode.ENTER) {
      if (event.target.id.indexOf('pseudo') !== -1) {
        pseudoSubmit.click();
      } else if (event.target.id.indexOf('message') !== -1) {
        submitButton.click();
      } else if (event.target.id.indexOf('reply') !== -1) {
        replySubmit.click();
      }
    }
  });
  setHeight();
});

socket.on('connect', function () {
  console.log('connected');
  socket.emit('getPosts');
});

socket.on('nbUsers', function (msg) {
  $("#nbUsers").html(msg.nb);
});

socket.on('loadPosts', function (posts) {
  console.log('Posts', posts);
  var reversed = posts.slice().reverse(); //creates a copy and reverses it
  console.log('Reversed', reversed);
  $.each(reversed, function (index, post) {
    //addMessage(id, msg, pseudo, date, self)
    console.log('Id: %d Author: %s Message: %s Date: %s', post.id, post.author, post.message, post.date);
    if (post.author === 'self') {
      addMessage(post.id, post.message, post.author, post.date, true);
    } else {
      addMessage(post.id, post.message, post.author, post.date, false);
    }
  });
});

socket.on('replyAdded', function (data, self) {
  console.log(data);
  var dude = data.pseudo;
  if (self) {
    dude = "Me";
  }
  var parent = $('#RepliesFor_' + data.id);
  var div = '<div class="row reply" id="Reply_' + data.id + '"><p class="infos"><span class="pseudo">' + dude + '</span>, <time class="date" title="' + data.date + '">' + data.date + '</time></p><p>' + data.message + '</p></div>';
  parent.append(div);
});

socket.on('message', function (data, self) {
  addMessage(data.id, data.message, data.pseudo, new Date().toISOString(), self);
  console.log(data);
});
var io;
var socket = io.connect();
var liEndTag = "</li>";
var baseReplyHtml = "<div class=\"input-group input-group-sm\"><textarea id=\"reply-input-{0}\" type=\"text\" class=\"form-control reply-input\"></textarea><span class=\"input-group-btn\"><button id=\"reply-btn-{0}\" class=\"btn btn-info btn-xs\" type=\"button\">Reply</button></span></div>";
var baseHtml = "<li class=\"list-group-item list-group-item{4}\"><div id=\"{5}-{0}\"><div id=\"post-image\"><img src=\"{6}\" id=\"img-post\"></div><div id=\"post-user\">{1}</div><time id=\"post-time\" datetime=\"{2}\"></time><div id=\"post-message\">{3}</div>";
var postHtml = baseHtml + baseReplyHtml + liEndTag;
var replyHtml = baseHtml + liEndTag;
var postsList = [];
var theUser = [];
var connected = false;

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
    var picture = reply.picture || 'img/noprofile.jpg';
    var r = replyHtml.format(reply._id, reply.username, reply.time, reply.message, '-reply', 'reply', picture);
    var firstItem = $('#post-' + postId).find('ul.replies').children().first();
    $('#post-' + postId).find('ul.replies').prepend(r);
    if ($('#post-' + postId).find('ul.replies li.more').is(":hidden"))
        $('#post-' + postId).find('ul.replies').children(".list-group-item-reply").fadeIn();
}

function createPost(post) {
    console.log('CLIENT - createPost', post);
    var picture = post.picture || 'img/noprofile.jpg';
    var p = postHtml.format(post._id, post.username, post.time, post.message, '', 'post', picture);
    postsList.prepend(p);
}

function initButtonEvents() {
    if (connected === false)
        return;

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

    $("li.more").click(function (evnt) {
        var that = $(this);
        $(this).fadeOut(function () {
            that.siblings().fadeIn();
        });
    });

}


function showPosts() {
    $('div.row.loader').hide();
    $('#posts-row').removeClass('transparent-div');
}

socket.on('connect', function () {
    console.log('CLIENT - Connected');
    connected = true;
    showPosts();
    theUser = {
        id: $('#userId').text(),
        name: $('#userName').text(),
        email: $('#userEmail').text(),
        picture: $('#img-profile-heading').attr('src')
    };
    postsList = $(posts);
    initButtonEvents();
    $('#input-primary').focus();
    $('time').timeago();
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

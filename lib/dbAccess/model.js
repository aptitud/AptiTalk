var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Hashtag = mongoose.model("Hashtag", {
    tag : String,
    posts : [{
        type : Schema.Types.ObjectId,
        ref : 'Post'
    }]
});

var Reply = mongoose.model("Reply", {
    parentPostId : String,
    username : String,
    time : Date,
    message : String,
});

var Post = mongoose.model("Post", {
    username : String,
    time : Date,
    message : String,
    replies : [{
        type : Schema.Types.ObjectId,
        ref : 'Reply'
    }],
    hashtags : [String]
});

module.exports.Post = Post;
module.exports.Reply = Reply;
module.exports.Hashtag = Hashtag;
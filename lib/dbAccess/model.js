var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Post = mongoose.model("Post", {
  username: String,
  time: Date,
  message: String,
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  hashtags: [String]
});

module.exports.Post = Post;

var User = mongoose.model("User", {
  identifier: String,
  name: String,
  email: String,
});

module.exports.User = User;
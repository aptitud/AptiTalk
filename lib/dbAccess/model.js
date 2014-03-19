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
	hashtags: [String],
	replyLevel: Number
});

module.exports.Post = Post;
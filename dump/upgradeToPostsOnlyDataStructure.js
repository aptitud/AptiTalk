var upgradeToPostsOnlyStructure = function (database) {
  var db = connect(database);

  //have we updated posts with reply level yet?
  var cursor = db.posts.find({
    "replyLevel": 0
  });

  var hasZeroLevels = cursor.hasNext();

  var cursor = db.posts.find({
    "replyLevel": 1
  });

  var hasOneLevels = cursor.hasNext();


  if (hasZeroLevels === false) {
    //backup tables
    db.replies.copyTo("repliesBeforeReplyLevels");
    db.posts.copyTo("postsBeforeReplyLevels");
    var cursor = db.posts.find({
      $where: "this.replies.length > 0"
    });

    var post;
    var newPost;
    var i;
    var reply;
    var replyId;
    var replyCursor;
    while (cursor.hasNext()) {
      post = cursor.next();
      for (i = 0; i < post.replies.length; i++) {
        replyId = post.replies[i];
        replyCursor = db.replies.find({
          _id: replyId
        });
        while (replyCursor.hasNext()) {
          reply = replyCursor.next();
          newPost = {
            _id: reply._id,
            replyLevel: 1,
            username: reply.username,
            message: reply.message,
            time: reply.time,
            hashtags: [],
            replies: []
          };

          db.posts.save(newPost);
        }
      }
    }

    db.posts.update({
      $where: "this.replyLevel === undefined"
    }, {
      $set: {
        replyLevel: 0,
      }
    }, {
      multi: true
    });
  }
};

upgradeToPostsOnlyStructure("localhost:27017/AptiTalk_Dev");
upgradeToPostsOnlyStructure("localhost:27017/AptiTalk_Prod");
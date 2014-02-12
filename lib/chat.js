// Handle the socket.io connections

var users = 0; //count the users
var io;
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var posts = [];
var mode;

function reloadUsers() { // Send the count of the users to all
  io.sockets.emit('nbUsers', {
    "nb": users
  });
}

function pseudoSet(socket) { // Test if the user has a name
  var test;
  socket.get('pseudo', function (err, name) {
    if (name === null) {
      test = false;
    } else {
      test = true;
    }
  });
  return test;
}

function returnPseudo(socket) { // Return the name of the user
  var pseudo;
  socket.get('pseudo', function (err, name) {
    if (name === null) {
      pseudo = false;
    } else {
      pseudo = name;
    }
  });
  return pseudo;
}

exports.connection = function (theIo, socket, theMode) { // First connection
  io = theIo;
  mode = theMode;
  users += 1; // Add 1 to the count
  reloadUsers(); // Send the count to all the users
  socket.on('message', function (data, self) { // Broadcast the message to all
    if (pseudoSet(socket)) {
      var replies = [];
      var transmit = {
        id: 0,
        date: new Date().toISOString(),
        pseudo: returnPseudo(socket),
        message: data,
        replies: replies
      };
      posts.push(transmit);
      transmit.id = posts.length;
      socket.emit('message', transmit, true);
      socket.broadcast.emit('message', transmit, false);
      console.log("user " + transmit.pseudo + " said \"" + transmit.message + "\"");
    }
  });

  socket.on('setPseudo', function (data) { // Assign a name to the user
    var testPseudo = data.toLowerCase();
    if (pseudoArray.indexOf(testPseudo) === -1) { // Test if the name is already taken
      socket.set('pseudo', testPseudo, function () {
        pseudoArray.push(testPseudo);
        socket.emit('pseudoStatus', 'ok');
        console.log("user " + testPseudo + " connected");
      });
    } else {
      socket.emit('pseudoStatus', 'error'); // Send the error
    }
  });

  socket.on('reply', function (data) {
    console.log(data);
    var transmit = {
      id: data.id,
      date: new Date().toISOString(),
      pseudo: data.pseudo,
      message: data.message
    };
    console.log(transmit);
    socket.emit('replyAdded', transmit, true);
    socket.broadcast.emit('replyAdded', transmit, false);
  });

  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
    if (pseudoSet(socket)) {
      var pseudo;
      socket.get('pseudo', function (err, name) {
        pseudo = name;
      });
      var index = pseudoArray.indexOf(pseudo);
      pseudo.slice(index - 1, 1);
    }
  });
};
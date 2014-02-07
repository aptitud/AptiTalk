//Customization

var appPort = 666;

// Librairies

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


var jade = require('jade');

var pseudoArray = ['admin']; //block the admin username (you can disable it)
var posts = [];

// Views Options

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", {layout:false})

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

// Render and send the main page

app.get('/', function(req, res){
  res.render('home.jade');
});

server.listen(appPort);

console.log("Server listening on port " + appPort);

// Handle the socket.io connections

var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
	users += 1; // Add 1 to the count
	reloadUsers(); // Send the count to all the users
	socket.on('message', function (data, self) { // Broadcast the message to all
		if(pseudoSet(socket))
		{	
			var replies = [];		
			var transmit = {id: 0, date: new Date().toISOString(), pseudo: returnPseudo(socket), message: data, replies: replies};
			posts.push(transmit);
			transmit['id'] = posts.length;
			socket.emit('message', transmit, true);
			socket.broadcast.emit('message', transmit, false);
			console.log("user "+ transmit['pseudo'] +" said \""+transmit['message']+"\"");
		}
	});

	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
            socket.set('pseudo', data, function () {
            pseudoArray.push(data);
            socket.emit('pseudoStatus', 'ok');
            console.log("user " + data + " connected");
			});
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});

	socket.on('reply', function (data) {
		console.log(data); 
		var transmit = {id: data['id'], date: new Date().toISOString(), pseudo: data['pseudo'], message: data['message']};
		console.log(transmit);
		socket.emit('replyAdded', transmit, true);
		socket.broadcast.emit('replyAdded', transmit, false);
	});

	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		reloadUsers();
		if (pseudoSet(socket))
		{
			var pseudo;
			socket.get('pseudo', function(err, name) {
				pseudo = name;
			});
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}

function pseudoSet(socket) { // Test if the user has a name
	var test;
	socket.get('pseudo', function(err, name) {
		if (name == null ) test = false;
		else test = true;
	});
	return test;
}

function returnPseudo(socket) { // Return the name of the user
	var pseudo;
	socket.get('pseudo', function(err, name) {
		if (name == null ) pseudo = false;
		else pseudo = name;
	});
	return pseudo;
}
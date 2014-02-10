//Customization

var appPort = 666;

// Librairies
var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var jade = require('jade');

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

var chat = require('./lib/chat.js');

io.sockets.on('connection', function(socket) {
	chat.connection(io,socket);
});

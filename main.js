const http = require('http');
const express = require("express");
const cors = require('cors');

// init variables
abonents = [];
var httpPort = 80;

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
var httpServer = http.createServer(app);
httpServer.listen(httpPort, () => console.log("HTTP listening on port " + httpPort));

queenServers = [{host: '127.0.0.1', port: 4444}, {host: '127.0.0.1', port: 4445}];

// queen client
var queenxml = require('./queenxml');

for (server of queenServers) {
	server.connection = new queenxml.QueenClient(server.host, server.port, (obj) => {
		content = JSON.stringify(obj);
		for (index in abonents) {
			abonents[index].emit('queenroom', content);
			console.log(`sent to ${index} : ${content}`);
		}
	});
}

// socket.io
const io = require('socket.io').listen(httpServer);
io.on('connection', (socket)=> {
	console.log('io.on(connection) : ', socket.id);
	abonents[socket.id] = socket;
	// handle disconnect
	socket.on('disconnect', (reason) => {
		console.log('io.on(disconnect) : ', socket.id, ' reason : ', reason );
		if (abonents[socket.id]) delete abonents[socket.id];
	});
	// handle an error
	socket.on('error', (error) => {
		console.log('io.on(error) : ', socket.id, ' error : ', error );
	});
	// handle incoming
	socket.on('queenroom', (data) => {
		try {
			for (server of queenServers) {
				server.connection.send(data);
			}
		}
		catch(err) {
			socket.emit('error', err);
		}
	});
});

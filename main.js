const http = require('http');
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const config = require('./config.json');
var httpPort = 80;

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
var httpServer = http.createServer(app);
httpServer.listen(httpPort, () => console.log("HTTP listening on port " + httpPort));

// queen client
var queenxml = require('./queenxml');

app.abonents = [];

// init static abonents
abonents = app.abonents;
for (room of config.queen_room) {
	abonents.push({
		type: "queen_room",
		config: room
	});
	abon = abonents[abonents.length-1];
	abon.room = new queenxml.QueenClient(room.host, room.port, (event, data) => {
		if (event === 'connect') {
			console.log(`queen room ${room.host}:${room.port} connected`);
		}
		else
		if (event === 'disconnect') {
			console.log(`queen room ${room.host}:${room.port} disconnected`);
		}
		else
		if (event === 'http') {
			// send a HTTP request
			axios({
				url: data.url,
				method: data.method,
				data: data.payload
			 }).then(() => {
			 })
		}
		else
		if (event === 'abonent') {
		}
	});
}

// http api
const httpapi = require('./httpapi');
httpapi(app);



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
			for (room of queenRooms) {
				room.client.send(data);
			}
		}
		catch(err) {
			socket.emit('error', err);
		}
	});
});



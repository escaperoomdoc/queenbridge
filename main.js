const http = require('http');
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const config = require('./config.json');
const abonents = require('./abonents/abonents');
const abonqueen = require('./abonents/abon-queen');
const abonhttp = require('./abonents/abon-http');
var httpPort = 80;

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
var httpServer = http.createServer(app);
httpServer.listen(httpPort, () => console.log("HTTP listening on port " + httpPort));

// init abonents class
app.queenbridge = {};
app.queenbridge.config = config;
app.queenbridge.abonents = new abonents.Abonents(app);

// init queen abonents (static creation)
for (cfg of config.queen_room) {
	app.queenbridge.abonents.register({
		type: "queen",
		id: cfg.id,
		config: cfg
	}, (error, abon) => {
		if (error) {
			console.log('error on abonent this.register : ' + error);
			return;
		}
		abon.agent = new abonqueen.QueenClient(abon);
	});
}

// init http api

abonhttp(app);

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



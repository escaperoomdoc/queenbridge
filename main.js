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

queenRooms = [{id: '1', host: '127.0.0.1', port: 4444}, {id: '2', host: '127.0.0.1', port: 4445}];

// queen client
var queenxml = require('./queenxml');

for (room of queenRooms) {
	room.client = new queenxml.QueenClient(room.host, room.port, (event, data) => {
		if (event === 'connect') {
			console.log(`queen room ${room.host}:${room.port} connected`);
		}		
		if (event === 'disconnect') {
			console.log(`queen room ${room.host}:${room.port} disconnected`);
		}		
		if (event === 'data') {
			content = JSON.stringify(data);
			for (index in abonents) {
				abonents[index].emit('queenroom', content);
				console.log(`sent to ${index} : ${content}`);
			}
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
			for (room of queenRooms) {
				room.client.send(data);
			}
		}
		catch(err) {
			socket.emit('error', err);
		}
	});
});

// RESTful API
app.post('/api/send/:id', async (req, res, next) => {
	try {
		if (req.body.payload) {
			for (room of queenRooms) {
				if (req.params.id === '*' || req.params.id === room.id) {
					room.client.send(req.body.payload)
				}
			}
		}
		res.status(200).send('OK');
	}
	catch(err) {
		if (err) return res.sendStatus(400, 'catch', err);
	}
})
app.get('/api/rooms', async (req, res, next) => {
	try {
		result = {};
		result.rooms = [];
		for (room of queenRooms) {
			result.rooms.push({
				host: room.host,
				port: room.port,
				connect: room.client.connected
			});
		}
		res.status(200).json(result);
	}
	catch(err) {
		if (err) return res.sendStatus(400, 'catch', err);
	}
})

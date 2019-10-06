const http = require('http');
const express = require("express");
const cors = require('cors');
const axios = require('axios');

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
			if (data.attributes.type === 'event:http') {
				// send a HTTP request
				httpData = JSON.parse(data.content);
				axios({
					url: httpData.url,
					method: httpData.method,
					data: httpData.payload
				 }).then(() => {
				 })
			}
			else {
				// send data to socket io abonents
				content = JSON.stringify(data);
				for (index in abonents) {
					abonents[index].emit('queenroom', content);
					console.log(`sent to ${index} : ${content}`);
				}
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
app.post('/api/test', async (req, res, next) => {
	try {
		var text = JSON.stringify(req.body);
		res.status(200).send('OK');
	}
	catch(err) {
		if (err) return res.sendStatus(400, 'catch', err);
	}
})
app.post('/api/rooms/:id', async (req, res, next) => {
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

/*
тезисы:
1. вся адресация будет иметь три уровня /node/channel/id, где node - GUID
	идентификатор ноды. В первых версиях node будет только local, то есть обмен
	осуществляется	в рамках локального бриджа; для распределенной архитектуры
	node может принимать референс на другие бриджы. Путь channel может принимать
	значения socket для socket io абонентов, значение http для абонентов HTTP,
	которые зарегистрировались (такое возможно для НЕброузеров, см п.4), а также
	значение room для абонентов queen room. Идея в том, что бридж будет некой
	формой абстрации, которая позволит обмениваться сообщениями между всеми
	компонентами системы. 
2. класс QueenSocket - обеспечивает связь со всемми socket.io кдиентами;
	каждый абонент автоматически регистрирует очередь /node/socket/:id
3. класс QueenRoom - обеспечивает связь по каналам socket io
	каждая комната автоматически регистрирует очередь /node/room/:id
4. класс QueenHttp - обеспечивает связь по каналу HTTP
	каждый комната автоматически регистрирует очередь /node/http/:id, причем http
	клиент не может получать сообщения (кроме ответов на свои запросы). Однако, если
	http клиентом является не браузер, а nodejs приложение, то такое приложение может
	подписаться на событие, просто указав свой IP, тогда ему можно будет отправить 
	HTTP-запрос в любой момент времени.

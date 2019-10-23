const http = require('http');
const express = require("express");
const cors = require('cors');
const axios = require('axios');

const amqpUrl = 'amqp://gqdqanlh:r0NzrzWsGh-wqzfy2IQV6Yf9e7R9LIKO@impala.rmq.cloudamqp.com/gqdqanlh';
// AMQP test
var amqp = require('amqplib/callback_api');
// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
function start() {
  amqp.connect(amqpUrl + "?heartbeat=60", function(err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
  startWorker();
}

var pubChannel = null;
var offlinePubQueue = [];
function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
                       function(err, ok) {
                         if (err) {
                           console.error("[AMQP] publish", err);
                           offlinePubQueue.push([exchange, routingKey, content]);
                           pubChannel.connection.close();
                         }
                       });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

// A worker that acks messages only if processed succesfully
function startWorker() {
  amqpConn.createChannel(function(err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });
    ch.prefetch(10);
    ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
      if (closeOnErr(err)) return;
      ch.consume("jobs", processMsg, { noAck: false });
      console.log("Worker is started");
    });

    function processMsg(msg) {
      work(msg, function(ok) {
        try {
          if (ok)
            ch.ack(msg);
          else
            ch.reject(msg, true);
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  });
}

function work(msg, cb) {
  console.log("Got msg", msg.content.toString());
  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

setInterval(function() {
  publish("", "jobs", new Buffer("work work work"));
}, 1000);

start();
return;


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
*/

const http = require('http');
const express = require("express");
const cors = require('cors');
const config = require('./config.json');
const abonents = require('./abonents/abonents');
const abonqueen = require('./abonents/abon-queen');
const abonhttp = require('./abonents/abon-http');
const abonsio = require('./abonents/abon-sio');
const topics = require('./abonents/topics');
const games = require('./games');
var httpPort = 80;

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
games(app);
app.use(express.static('public'));

// start http server
var httpServer = http.createServer(app);
httpServer.listen(config.settings.httpPort, () => {});

// init abonents and topics
app.queenbridge = {};
app.queenbridge.httpServer = httpServer;
app.queenbridge.config = config;
app.queenbridge.abonents = new abonents.Abonents(app);
app.queenbridge.topics = new topics.Topics(app);

// init queen abonents
abonqueen(app);

// init http api abonents
abonhttp(app);

// init socket io abonents
abonsio(app);

console.log(`queen bridge started on ${config.settings.httpPort}...`);


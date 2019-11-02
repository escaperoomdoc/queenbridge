const http = require('http');
const express = require("express");
const cors = require('cors');
const config = require('./config.json');
const abonents = require('./abonents/abonents');
const abonqueen = require('./abonents/abon-queen');
const abonhttp = require('./abonents/abon-http');
const abonsio = require('./abonents/abon-sio');
var httpPort = 80;

// init app, HTTP server and static recourses
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
var httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {});

// init abonents
app.queenbridge = {};
app.queenbridge.httpServer = httpServer;
app.queenbridge.config = config;
app.queenbridge.abonents = new abonents.Abonents(app);

// init queen abonents
abonqueen(app);

// init http api
abonhttp(app);

// init socket io abonents
abonsio(app);

console.log("queen bridge started...");

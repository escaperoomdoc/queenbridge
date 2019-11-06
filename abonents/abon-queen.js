
const xmlparse = require('xml-parser');
const net = require('net');
const axios = require('axios');

function QueenClient(abon) {
	this.client = new net.Socket();
	this.abon = abon;
	this.connected = false;
	this.stream = "";
	this.scripts = {};
	this.io = {};
	this.state = {};
	this.abon.setOnline(false);
	var that = this;
	// queen room connect event
	this.client.on('connect', () => {
		this.abon.setOnline(true);
		console.log(`queen room ${that.abon.config.host}:${that.abon.config.port} connected`);
	})
	// queen room receive event
	this.client.on('data', function(chunk) {
		try {
			// try parse message
			var str = chunk.toString('utf8');
			that.stream += str;
			while(true) {
				var begin = that.stream.indexOf('<response');
				if (begin < 0) break;
				var end = that.stream.indexOf('</response>');
				if (end < 0) break;
				end += 11;
				var response = that.stream.slice(begin, end);
				var obj = xmlparse(response).root;
				if (!obj.attributes.type) throw "message type not found";
				try {
					// try handle message
					if (obj.attributes.type === "connected") {
						that.client.write("setname queenbridge\n");
						that.client.write("subscribe\n");
						that.client.write("getscripts\n");
						that.client.write("getlanguage\n");
						that.client.write("getstates\n");
						that.client.write("getmode\n");
					}
					else
					if (obj.attributes.type === "getscripts") {
						that.scripts = {
							scenario: {},
							macro: {}
						};
						for (item of obj.children) {
							if (item.name === "macro") {
								that.scripts.macro[item.attributes.name] = {};
							}
							if (item.name === "scenario") {
								var scenario = that.scripts.scenario[item.attributes.name] = {};
								scenario.stages = {};
								for (stage of item.children) {
									if (stage.name === "stage" ) {
										scenario.stages[stage.attributes.name] = {}
									}
								}
							}
						}
						that.autopublish("scripts", that.scripts);
					}
					else
					if (obj.attributes.type === "getlanguage") {
						that.state.language = obj.content;
						that.autopublish("language", obj.content);
					}
					else
					if (obj.attributes.type === "getstates") {
						content = JSON.parse(obj.content);
						that.io = { pwm: {}, ain: {}, out: {}, din: {}, uni: {} };
						for (item of content.objects) {
							var arr = that.io[item.type];
							if (arr) {
								arr[item.name] = {};
								arr[item.name].state = parseInt(item.state);
							}
						}
						that.autopublish("states", content);
					}
					else
					if (obj.attributes.type === "getmode") {
						var sl = obj.content.split(":");
						if (sl.length > 2) throw "more than 2 parameters"; else
						if (sl.length === 2) that.state.stage = sl[1]; else
						that.state.mode = sl[0];
						that.autopublish("mode", that.state.mode);
					}
					else
					if (obj.attributes.type === "event:trigger") {
						content = JSON.parse(obj.content);
						for (item of content.objects) {
							var arr = that.io[item.type];
							if (arr && arr[item.name]) {
								arr[item.name].state = parseInt(item.state);
							}
						}
						that.autopublish("trigger", content);
					}
					else
					if (obj.attributes.type === "event:mode") {
						that.state.mode = obj.content;
						that.autopublish("mode", obj.content);
					}
					else
					if (obj.attributes.type === "event:scenario") {
						that.state.scenario = obj.content;
						that.autopublish("scenario", obj.content);
					}
					else
					if (obj.attributes.type === "event:stage") {
						var sl = obj.content.split(":");
						if (sl.length != 3) throw "invalid event:stage";
						that.state.stagePrev = sl[0];
						that.state.stage = sl[1];
						that.state.stageReason = sl[2];
						that.autopublish("stage", sl[1]);
					}
					else
					if (obj.attributes.type === "event:language") {
						that.state.language = obj.content;
						that.autopublish("language", obj.content);
					}
					else
					if (obj.attributes.type === "event:reminder") {
						// pass obj.content somewhere...
						that.autopublish("reminder", obj.content);
					}
					else
					if (obj.attributes.type === "event:json") {
						json = JSON.parse(obj.content);
						if (json.type === 'abonent') {
							that.abon.owner.send({
								id: that.abon.id,
								msgs: [{
									dstId: json.id,
									payload: json.payload									
								}]
							}, (error, report) => {
							});
						} else
						if (json.type === 'http') {
							axios({
								url: json.url,
								method: json.method,
								data: json.payload,
								timeout: 3000
							}).then((response) => {
								console.log(response);
							}).catch((error) => {
								throw error.message;
							}).finally(() => {
							});
						}
						that.autopublish("json", json);
					}
					else {
						if (abon.queue.length) {
							var msg = abon.queue[0];
							if (msg.pending && msg.msgId==obj.attributes.id) {
								abon.queue.shift();
							}
						}
					}
				}
				catch(error) {
					console.log(`handle (${obj.attributes.type}) error : ${error}`);
				}
				that.stream = that.stream.substr(end - that.stream.length);
			}
		}
		catch(error) {
			that.stream = "";
			console.log('parse error : ' + error);
		}
	});
	// queen room disconnect or connect failure event
	this.client.on('close', function() {
		if (that.abon.online) {
			console.log(`queen room ${that.abon.config.host}:${that.abon.config.port} disconnected`);
		}
		that.abon.setOnline(false);
		setTimeout(() => {
			that.client.connect({ port: that.abon.config.port, host: that.abon.config.host })
		}, 1000);
	});
	this.client.on('error', (err) => {
		//	console.log('TCP error : ' + err.stack)
	});
	this.client.connect({ port: that.abon.config.port, host: that.abon.config.host });
	// send function
	this.send = function(data) {
		this.client.write(data+"\n");
	}
	// agent interface
	this.trySend = function() {
		if (!abon.online || !abon.queue.length) return;
		msg = abon.queue[0];
		text = '';
		if (msg.msgId) text += ('[' + msg.msgId + ']');
		text += msg.payload;		
		this.send(text);
		if (msg.options && msg.options.ack) msg.pending = true;
		else abon.queue.shift();
	}
	// autopublish
	this.autopublish = function(type, data) {
		if (abon.config.autopublish[type]) this.publish(abon.config.autopublish[type], type, data);
		if (abon.config.autopublish["all"]) this.publish(abon.config.autopublish["all"], type, data);
	}
	this.publish = function(topics, type, data) {
		try {
			for (topic of topics) {
				abon.owner.app.queenbridge.topics.publish({
					id: abon.id,
					msgs: [{
						topic: topic,
						msgId: null,
						payload: {
							type: type,
							data: data
						}
					}]
				}, (error) => {
					if (error) throw error;
				})
			}
		}
		catch(error) {
			console.log("error on abonqueen publish: " + error);
		}
	}
}

module.exports = (app) => {
	for (cfg of app.queenbridge.config.abonqueen) {
		app.queenbridge.abonents.register({
			type: "queen",
			id: cfg.id,
			config: cfg
		}, (error, abon) => {
			if (error) {
				console.log('error on abonent this.register : ' + error);
				return;
			}
			abon.config = cfg;
			abon.static = true;
			abon.agent = new QueenClient(abon);
		});
	}	
}

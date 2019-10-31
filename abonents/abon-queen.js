
const xmlparse = require('xml-parser');
const net = require('net');
const axios = require('axios');

function QueenClient(abon) {
	this.client = new net.Socket();
	this.abon = abon;
	this.abon.status = "offline";
	this.connected = false;
	this.stream = "";
	this.scripts = {};
	this.io = {};
	this.state = {};
	var that = this;
	// queen room connect event
	this.client.on('connect', () => {
		that.connected = true;
		that.abon.status = "online";
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
					}
					else
					if (obj.attributes.type === "getlanguage") {
						that.state.language = obj.content;
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
					}
					else
					if (obj.attributes.type === "getmode") {
						var sl = obj.content.split(":");
						if (sl.length > 2) throw "more than 2 parameters"; else
						if (sl.length === 2) that.state.stage = sl[1]; else
						that.state.mode = sl[0];
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
					}
					else
					if (obj.attributes.type === "event:mode") {
						that.state.mode = obj.content;
					}
					else
					if (obj.attributes.type === "event:scenario") {
						that.state.scenario = obj.content;
					}
					else
					if (obj.attributes.type === "event:stage") {
						var sl = obj.content.split(":");
						if (sl.length != 3) throw "invalid event:stage";
						that.state.stagePrev = sl[0];
						that.state.stage = sl[1];
						that.state.stageReason = sl[2];
					}
					else
					if (obj.attributes.type === "event:language") {
						that.state.language = obj.content;
					}
					else
					if (obj.attributes.type === "event:reminder") {
						// pass obj.content somewhere...
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
		if (that.connected) {
			that.connected = false;
			that.abon.status = "offline";
			console.log(`queen room ${that.abon.config.host}:${that.abon.config.port} disconnected`);
		}
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
	this.notify = function() {
		// TODO: set nextTick, timeout or promises to deliver async + use
		// an identifier (i.e. [msgId]set out.out_1.state on). But for now
		// just send in a cycle...
		if (this.connected) {
			abon.owner.receive({id: abon.id}, (error, msgs) => {
				try {
					if (error) throw error;
					for (msg of msgs) {
						this.send(msg.payload);
					}
				}
				catch(error) {
					console.log('queenxml notify error:' + error);
				}					
			});
		}
	}
}

module.exports = (app) => {
	for (cfg of app.queenbridge.config.queen_room) {
		app.queenbridge.abonents.register({
			type: "queen",
			id: cfg.id,
			config: cfg
		}, (error, abon) => {
			if (error) {
				console.log('error on abonent this.register : ' + error);
				return;
			}
			abon.agent = new QueenClient(abon);
		});
	}	
}

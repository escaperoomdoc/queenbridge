const uuid = require('uuidv4').default;

function Abonents(app) {
   this.abonents = [];
   this.messageCounter = 0;
	// finds abonent by id
	this.get = function(id) {
		if (id) {
			for (abon of this.abonents) {
				if (abon.id === id) return abon;
			}
		}
		return null;
	}
	this.getIndex = function(id) {
		if (id) {
			for (index in this.abonents) {
				if (this.abonents[index].id === id) return index;
			}
		}
		return -1;
	}
	this.getlist = function(callback) {
		try {
			var result = [];
			for (abon of this.abonents) {
				result.push({
					id: abon.id,
					type: abon.type,
					queue: abon.queue.length,
					alias: abon.alias,
					status: abon.status,
					tola: abon.tola
				})
			}
			return callback(null, result);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	this.isOnline = function() {
		return status === 'online';
	}
	this.register = function(data, callback) {
		try {
			if (data.id) {
				var index = this.getIndex(data.id);
				if (index>=0) {
					if (!this.abonents[index].isOnline() && data.override) {
						this.abonents.splice(index,1);
					}
					else throw `abonent [${data.id}] already exists`;
				}
			}
			var abon = {};
			if (data.type === "queen") {
				abon.config = data.config;
				abon.static = true;
			}
			else
			if (data.type === "sio") {
			}
			else
			if (data.type === "http") {
			}
			else throw "unknown abonent type"
			abon.type = data.type;
			abon.id = data.id ? data.id : uuid();
			abon.keepOffline = data.keepOffline ? data.keepOffline : null;
			abon.queue = [];
			abon.status = "passive";
			this.abonents.push(abon);
			abon.owner = this;
			return callback(null, abon);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	this.unregister = function(data, callback) {
		try {
			var index = this.getIndex(data.id);
			if (index<0) throw `abonent [${data.id}] not found`;
			if (this.abonents[index].static) throw `cannot delete static abonent`;
			this.abonents.splice(index,1);
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}
	}
	this.send = function(data, callback) {
		try {
			var abon = this.get(data.id);
			var report = [];
			settings = app.queenbridge.config.settings;
			for (msg of data.msgs) {
				var dst = this.get(msg.dstId);
				if (!dst) {
					report.push({dstId: msg.dstId, status: "error(no abonent)"});
					continue;
				}
				if (settings.queueSizeLimit && dst.queue.length >= settings.queueSizeLimit) {
					report.push({dstId: msg.dstId, status: "error(queue overflow)"});
					continue;	
				}
				if (!msg.msgId && app.queenbridge.config.settings.requireMessageId) {
					msg.msgId = ++ this.messageCounter;
				}
				msg.srcId = abon ? abon.id : null;
				if (!msg.options) msg.options = {};
				msg.options.tos = Date.now();
				dst.queue.push(msg);
				if (dst.agent) dst.agent.wakeup();
				report.push({dstId: msg.dstId, status: "ok"});
			}
			return callback(null, report);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	this.receive = function(params, callback) {
		try {
			var abon = this.get(params.id);
			if (!abon) throw `abonent [${abon.id}] not found`;
			var result = [];
			const now = Date.now();
			// temp solution: pass'n'delete messages without ack
			for (msg of abon.queue) {
				result.push({
					srcId: msg.srcId,
					msgId: msg.msgId,
					time: now - msg.tos,
					payload: msg.payload
				})
			}
			abon.queue = [];
			return callback(null, result);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	setInterval(() => {
		
	}, 1000)
}

module.exports.Abonents = Abonents;


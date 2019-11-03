const uuid = require('uuidv4').default;

function Abonents(app) {
   this.abonents = [];
	this.messageCounter = 0;
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
					status: abon.online ? "online" : "offline",
					tola: abon.tola
				})
			}
			return callback(null, result);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	this.register = function(data, callback) {
		try {
			var abon = {};
			var newinstance = true;
			if (data.id) {
				var index = this.getIndex(data.id);
				if (index>=0) {
					abon = this.abonents[index];
					var overridable = true;
					if (abon.online) overridable = false;
					if (abon.static) overridable = false;
					if (overridable && data.override) newinstance = false;
					else throw `abonent [${data.id}] already exists`;
				}
			}			
			abon.type = data.type;
			abon.id = data.id ? data.id : uuid();
			abon.keepOffline = data.keepOffline ? data.keepOffline : null;
			abon.online = false;
			abon.timeofDisconnect = 0;
			if (newinstance) {
				abon.queue = [];
				abon.owner = this;
				abon.setOnline = function(state) {
					if (!state && abon.online) this.timeofDisconnect = Date.now();
					abon.online = state;
				}
				this.abonents.push(abon);
			}
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
				if (!msg.msgId) msg.msgId = ++this.messageCounter;
				msg.srcId = abon ? abon.id : null;
				if (!msg.options) msg.options = {};
				msg.options.tos = Date.now();
				dst.queue.push(msg);
				report.push({dstId: msg.dstId, status: "ok"});
				if (dst.agent) dst.agent.trySend();
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
			for (msg of abon.queue) {
				result.push({
					srcId: msg.srcId,
					msgId: msg.msgId,
					time: now - msg.tos,
					payload: msg.payload
				})
			}
			abon.queue = [];	// temp solution
			return callback(null, result);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	setInterval(() => {
		for (var index = 0; index < this.abonents.length; index++) {
			var abon = this.abonents[index];
			if (abon.static || abon.online) continue;
			if (abon.keepOffline && abon.keepOffline>Date.now()-abon.timeofDisconnect) {
				continue;
			}
			console.log(`abonent ${abon.id} deleted by garbage collector`);
			this.abonents.splice(index,1);
			index--;
		}
		for (abon of this.abonents) {
			if (abon.agent) abon.agent.trySend();
		}		
	}, 100)
};

module.exports.Abonents = Abonents;


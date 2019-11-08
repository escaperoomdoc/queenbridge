// QueenBridge socket.io wrapper, purposes:
// 1. offline queues, socket.io does non provide
// 2. autoping, socket.io disconnects on timeout
// 3. simplification: register, error handling, queueing, etc... wrapper takes care of it
// 4. interface unification, socket.io sometimes changes it, wrapper takes care of it
// 5. if we will have to avoid of socket.io in the future, wrapper provides this easily

function QueenBridge(host, options) {
	this.socket = null;
	this.queue = [];
	this.events = {};
	this.connected = false;
	this.msgId = 0;
	this.pending = 0;
	this.register = {
		id: null,
		autoping: 1000,
		keepOffline: 10000,
		override: false
	}
	const that = this;
	this.handleRegisterOptions = function(options) {
		if (!options) return;
		this.register.id = options.id;
		this.register.override = options.override;
		// if autoping is not defined => autoping = 1000 by default
		if (options.autoping === null || options.autoping >= 1000 && options.autoping <= 10000) {
			this.register.autoping = options.autoping;
		}
		if (options.keepOffline === null || options.keepOffline) {
			this.register.keepOffline = options.keepOffline;
		}			
	}
	this.requestAbonents = function() {
		that.socket.emit('/api/abonents');
	}
	this.registerAbonent = function(options) {
		this.handleRegisterOptions(options);
		that.socket.emit('/api/register', this.register);
		this.requestAbonents();
	}
	this.on = function(event, callback) {
		this.events[event] = callback;
	}
	function connect() {
		that.socket = io.connect(host);
		that.socket.on('connect', function() {
			that.connected = true;
			if (that.events['connect']) that.events['connect']();
			that.registerAbonent(options);
		})
		that.socket.on('disconnect', function() {
			that.connected = false;
			if (that.events['disconnect']) that.events['disconnect']();
		})
		that.socket.on('/api/ping', function(data) {
			if (that.events['ping']) that.events['ping'](data);
		})
		that.socket.on('/api/abonents', function(data) {
			if (that.events['abonents']) that.events['abonents'](data);
		})
		that.socket.on('/api/register', function(data) {
			if (data.id) {
				that.register.id = data.id;
				if (that.events['register']) that.events['register'](data);
			}
			if (data.error) {
				data.type = 'register';
				if (that.events['error']) that.events['error'](data);
			}
		})
		that.socket.on('/api/receive', function(data) {
			if (that.events['receive']) {
				try {
					for (msg of data.msgs) {
						that.events['receive']({
							id: msg.dstId,
							payload: msg.payload
						});
					}
				}
				catch(error) {
					data = {type: 'receive', error: error};
					if (that.events['error']) that.events['error'](data);
				}
			}
			else
			if (that.events['receivebulk']) {
				that.events['receivebulk'](data);
			}
		})
		that.socket.on('/api/send', function(data) {
			if (that.pending>0 && that.queue.length>=that.pending) {
				that.queue.splice(0, that.pending);
			}
		})
	}
	this.transfer = function() {
		if (that.connected && that.queue.length>0 && that.pending===0) {
			that.socket.emit('/api/send', {msgs: that.queue});
			that.queue = []; // replace with the code below later...
			//that.pending = that.queue.length;
		}		
	}
	this.send = function(id, payload, options) {
		that.queue.push({
			dstId: id,
			msgId: ++that.msgId,
			payload: payload,
			options: options ? options : null
		});
		this.transfer();
	}
	this.sendbulk = function(data) {
		that.queue.concat(data.msgs);
		this.transfer();
	}
	this.ping = function(id) {
		that.socket.emit('/api/ping', {id: id});
	}	
	connect();
	setInterval(function() {
		that.transfer();
	}, 100);
	if (this.autoping) {
		setInterval(function() {
			that.socket.emit('/api/ping');
		}, this.autoping)
	}
}


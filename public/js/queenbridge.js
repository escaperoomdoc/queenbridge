
function QueenBridge(host, options) {
	this.socket = null;
	this.id = null;
	this.queue = [];
	this.events = {};
	this.connected = false;
	this.msgId = 0;
	this.pending = 0;
	const that = this;
	if (options) {
		this.id = options.id;
	}
	this.on = function(event, callback) {
		this.events[event] = callback;
	}	
	function connect() {
		that.socket = io.connect(host);
		that.socket.on('connect', function() {
			that.connected = true;
			that.socket.emit('/api/register', {id: that.id});
			if (that.events['connect']) that.events['connect']();
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
				that.id = data.id;
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
	this.requestAbonents = function() {
		that.socket.emit('/api/abonents');
	}
	this.registerAbonent = function(id) {
		that.socket.emit('/api/register', {id: id});
		requestAbonents();
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
	connect();
	setInterval(function() {
		that.transfer();
	}, 100);
	setInterval(function() {
		that.socket.emit('/api/ping');
	}, 1000)	
}


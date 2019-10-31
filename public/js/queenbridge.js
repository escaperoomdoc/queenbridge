

function QueenBridge(host, options) {
	this.socket = null;
	this.id = null;
	this.queue = [];
	this.connected = false;
	const that = this;
	if (options) {
		this.id = options.id;
	}
	this.on = function(event, callback) {
		this.events[event] = callback;
	}	
	function connect() {
		this.socket = io.connect(host);
		this.socket.on('connect', function() {
			this.connected = true;
			that.connected = true;
			if (this.events['connect']) this.events['connect']();
		})
		this.socket.on('disconnect', function() {
			this.connected = false;
			that.connected = false;
			if (this.events['disconnect']) this.events['disconnect']();
		})		
	}
	connect();
}



/*
let QueenBridge = {
	// members
	socket: null,
	id: null,
	queue: [],
	connected: false,
	
	// private methods
	transfer: function() {
		if(this.connected) {
			item = this.queue.shift();
			if(item) {
				let text = JSON.stringify(item);
				this.socket.emit('qwbroker', text);
			}
		}		
	},

	// interface methods
	connect(host, fn) {
		this.socket = io.connect(host);
		that = this;
		this.socket.on("connect", function() {
			that.connected = true;
			fn("connect");
		});
		this.socket.on("disconnect", function() {
			that.connected = false;
			fn("disconnect");
		});
		this.socket.on('qwbroker', function(data) {
			fn("message", data);
			return;
			try {
				var obj = JSON.parse(data);
				logger.value += data;
				//that.socket.emit('qwbroker', '{"type":"delivered"}');
			}
			catch(error) {
				console.log('ERROR : ' + error + ' # ' + data);
			}
		});
		setInterval(() => {
			this.transfer();
		}, 100);		
	},
	register(id, options) {
		this.id = id;
		let item = {};
		item.type = "register";
		item.srcId = id;
		if (options) {
			item.options = {};
			if (options.name) item.options.name = options.name;
			if (options.keepOffline) item.options.keepOffline = options.keepOffline;
		}
		this.queue.push(item);
		this.transfer();
	},
	send(dstId, payload, options) {
		let item = {};
		item.type = "message";
		item.srcId = this.id;
		item.dstId = dstId;
		item.messageId = UUID();
		if (options) {
			item.options = {};
			if (options.qos) item.options.qos = options.qos;
			if (options.ttl) item.options.ttl = options.ttl;
		}
		item.payload = payload;
		this.queue.push(item);
		this.transfer();
	}
};
*/





const xmlparse = require('xml-parser');
const net = require('net');

function QueenClient(host, port, callback) {
	this.client = new net.Socket();
	this.connected = false;
	this.stream = "";
	var that = this;
	// queen room connect event
	this.client.on('connect', () => {
		console.log(`TCP connected to queen room ${host}:${port}`);
		that.client.write("setname queenbridge\n");
		that.client.write("subscribe\n");
		that.client.write("getstates\n");
		that.connected = true;
		callback('connect');
	})
	// queen room receive event
	this.client.on('data', function(chunk) {
		try {
			var str = chunk.toString('utf8');
			that.stream = "asdfasdfasdfasd"
			that.stream += str;
			that.stream += "asdfasdfasdfasd"
			while(true) {
				var begin = that.stream.indexOf('<response');
				if (begin < 0) break;
				var end = that.stream.indexOf('</response>');
				if (end < 0) break;
				end += 11;
				var response = that.stream.slice(begin, end);
				var obj = xmlparse(response).root;
								
				if (obj.attributes) {
					if (obj.attributes.type === 'connected') {
						
					}
					else
					if (obj.attributes.type === 'event:trigger' || obj.attributes.type === 'getstates') {
						items = obj.content.split(",");
						for (item of items) {
							console.log(item);
						}
					}
				}				

				that.stream = that.stream.substr(end - that.stream.length);

			}
			/*
			
			console.log(str);
			console.log("<<<DELAY>>>");
			
			if(0)

			callback('data', obj);
			*/
		}
		catch(error) {
			that.stream = "";
			console.log('receive error : ' + error);
		}
	});
	// queen room disconnect or connect failure event
	this.client.on('close', function() {
		if (that.connected) {
			that.connected = false;
			callback('disconnect');
		}
		setTimeout(() => {
			that.client.connect({ port: port, host: host })
		}, 1000);
	});
	this.client.on('error', (err) => {
		//	console.log('TCP error : ' + err.stack)
	});
	this.client.connect({ port: port, host: host });
	// send function
	this.send = function(data) {
		this.client.write(data+"\n");
	}
}

module.exports.QueenClient = QueenClient;


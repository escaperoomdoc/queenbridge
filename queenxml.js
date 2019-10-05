
const xmlparse = require('xml-parser');
const net = require('net');

function QueenClient(host, port, fn) {
	this.client = new net.Socket();
	// queen room connect event
	this.client.on('connect', () => {
		console.log(`TCP connected to queen room ${host}:${port}`);
		this.client.write("setname gameserver\n");
		this.client.write("subscribe\n");
	})
	// queen room receive event
	this.client.on('data', function(chunk) {
		try {
			var str = chunk.toString('utf8');
			var obj = xmlparse(str).root;
			delete obj.children;
			fn(obj);
			/*
			content = JSON.stringify(obj.root);
			for (index in abonents) {
				abonents[index].emit('queenroom', content);
				console.log(`sent to ${index} : ${content}`);
			}
			*/
			/*
			if (content[0] === '@') {
				arr = content.split("@");
				if (arr.length !== 3) throw "wrong reminder format";
				for (abon of abons) {
					if (arr[1] === abon.name) {
						abon.socket.emit('server2client', `{"command":"${arr[2]}"}`);
						console.log(`sent to ${arr[1]} : ${arr[2]}`);
					}
				}
			}
			*/
		}
		catch(error) {
			console.log('receive error : ' + error);
		}
	});
	// queen room disconnect or connect failure event
   this.client.on('close', function() {
		setTimeout(() => this.client.connect({ port: port, host: host }), 1000);
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


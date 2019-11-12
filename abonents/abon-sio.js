// socket.io
const socketio = require('socket.io');
var connections = {};

module.exports = (app) => {
   io = socketio.listen(app.queenbridge.httpServer);
   io.on('connection', (socket)=> {
     	console.log('io.on(connection) : ', socket.id);
     	connections[socket.id] = socket;
     	// handle disconnect
     	socket.on('disconnect', (reason) => {
			var abonName = '';
			if (connections[socket.id]) {
				if (connections[socket.id].abon) {
					connections[socket.id].abon.setOnline(false);
					abonName = ' [' + connections[socket.id].abon.id + ']';
				}
				delete connections[socket.id];
			}
			console.log('io.on(disconnect) : ', socket.id, abonName, ', reason - ', reason );
		});
      // handle an error
      socket.on('error', (error) => {
      	console.log('io.on(error) : ', socket.id, ' error : ', error);
      });
      // handle API
      socket.on('/api/ping', (data) => {
      	socket.emit('/api/ping', (data && data.id) ? {id: data.id} : {});
      });
      socket.on('/api/abonents', (data) => {
      	try {
          	app.queenbridge.abonents.getlist((error, data) => {
            	if (error) throw error;
            	socket.emit('/api/abonents', {abonents: data});
         	});
         }
      	catch(error) {
         	socket.emit('/api/abonents', {error: error});
      	}
      });        
      socket.on('/api/register', (data) => {
      	try {
         	data.type = "sio";
				var prevAbon = connections[socket.id].abon;
				if (prevAbon) {
					app.queenbridge.abonents.unregister({id: prevAbon.id}, (error) => {
						if (error) console.log('unregister error: ' + error);
						else {
							console.log(`unregistering abonent ${prevAbon.id}...`);
							delete connections[socket.id].abon;
						}
					})
				}
         	app.queenbridge.abonents.register(data, (error, abon) => {
					if (error) throw error;
					socket.emit('/api/register', {id: abon.id});
					connections[socket.id].abon = abon;
					abon.agent = connections[socket.id];
					abon.online = true;
					console.log(`registering new abonent ${abon.id}...`);
              	connections[socket.id].trySend = function() {
						if (!abon.online || !abon.queue.length) return;
						var params = {
							id: abon.id,
							ack: false,
							max: null
						};	
						app.queenbridge.abonents.receive(params, (error, result) => {
							if (error) throw error;
							socket.emit('/api/receive', {msgs: result});
						});						
						abon.queue = [];
					}
      		});
   		}
      	catch(error) {
           	socket.emit('/api/register', {error: error});
      	}
      });
      socket.on('/api/unregister', (data) => {
      	try {
				app.queenbridge.abonents.unregister(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/unregister', {});
            });
         }
         catch(error) {
      		socket.emit('/api/unregister', {error: error});
         }
      });
		socket.on('/api/send', (data) => {
			try {
				data.id = connections[socket.id].abon ? connections[socket.id].abon.id : null;
				app.queenbridge.abonents.send(data, (error, report) => {
					if (error) throw error;
					socket.emit('/api/send', report);
				});
			}
			catch(error) {
				socket.emit('/api/send', {error: error});
			}
		});
		socket.on('/api/receive', (data) => {
			console.log('response on receive');
		});
		socket.on('/api/topic', (data) => {
      	try {
      		app.queenbridge.topics.topic(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/topic', report);
      		});
      	}
      	catch(error) {
      		socket.emit('/api/topic', {error: error});
         }
		});
		socket.on('/api/untopic', (data) => {
      	try {
      		app.queenbridge.topics.untopic(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/untopic', report);
      		});
      	}
      	catch(error) {
      		socket.emit('/api/untopic', {error: error});
         }
		});
		socket.on('/api/subscribe', (data) => {
      	try {
				data.id = connections[socket.id].abon ? connections[socket.id].abon.id : null;
      		app.queenbridge.topics.subscribe(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/subscribe', report);
      		});
      	}
      	catch(error) {
      		socket.emit('/api/subscribe', {error: error});
         }
		});
		socket.on('/api/unsubscribe', (data) => {
      	try {
				data.id = connections[socket.id].abon ? connections[socket.id].abon.id : null;
      		app.queenbridge.topics.unsubscribe(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/unsubscribe', report);
      		});
      	}
      	catch(error) {
      		socket.emit('/api/unsubscribe', {error: error});
         }
		});
		socket.on('/api/publish', (data) => {
      	try {
				data.id = connections[socket.id].abon ? connections[socket.id].abon.id : null;
      		app.queenbridge.topics.publish(data, (error) => {
            	if (error) throw error;
            	socket.emit('/api/publish', report);
      		});
      	}
      	catch(error) {
      		socket.emit('/api/publish', {error: error});
         }
   	});
	});
}


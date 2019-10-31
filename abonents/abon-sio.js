// socket.io
const socketio = require('socket.io');
var connections = [];

module.exports = (app) => {
    io = socketio.listen(app.queenbridge.httpServer);
    io.on('connection', (socket)=> {
        console.log('io.on(connection) : ', socket.id);
        connections[socket.id] = socket;
        // handle disconnect
        socket.on('disconnect', (reason) => {
            console.log('io.on(disconnect) : ', socket.id, ' reason : ', reason );
            if (connections[socket.id]) delete connections[socket.id];
        });
        // handle an error
        socket.on('error', (error) => {
            console.log('io.on(error) : ', socket.id, ' error : ', error );
        });
        // handle API
        socket.on('/api/ping', (data) => {
            socket.emit('/api/ping', '');
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
                app.queenbridge.abonents.register(data, (error, abon) => {
                    if (error) throw error;
                    socket.emit('/api/register', {id:abon.id});
                });
            }
            catch(error) {
                socket.emit('/api/register', {error: error});
            }
        });
        socket.on('/api/unregister', (data) => {
            try {
                app.queenbridge.abonents.unregister(req.body, (error) => {
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
                app.queenbridge.abonents.send(req.body, (error, report) => {
                    if (error) throw error;
                    socket.emit('/api/send', report);
                });
            }
            catch(error) {
                socket.emit('/api/send', {error: error});
            }
        });
        socket.on('/api/receive', (data) => {
            socket.emit('/api/receive', {error: 'not implemented for socket.io'});
        });        
    });
}



module.exports = (app) => {
	app.post('*', async (req, res, next) => {
		return next();
	})
	app.post('/api/register', async (req, res, next) => {
		try {
			//app.abonents[0].room.send("set out.out_1.state on");
			res.status(200).send('OK');
		}
		catch(err) {
			if (err) return res.sendStatus(400, 'catch', err);
		}
	})
	app.post('/api/rooms/:id', async (req, res, next) => {
		try {
			if (req.body.payload) {
				for (room of queenRooms) {
					if (req.params.id === '*' || req.params.id === room.id) {
						room.client.send(req.body.payload)
					}
				}
			}
			res.status(200).send('OK');
		}
		catch(err) {
			if (err) return res.sendStatus(400, 'catch', err);
		}
	})
	app.get('/api/rooms', async (req, res, next) => {
		try {
			result = {};
			result.rooms = [];
			for (room of queenRooms) {
				result.rooms.push({
					host: room.host,
					port: room.port,
					connect: room.client.connected
				});
			}
			res.status(200).json(result);
		}
		catch(err) {
			if (err) return res.sendStatus(400, 'catch', err);
		}
	})
}


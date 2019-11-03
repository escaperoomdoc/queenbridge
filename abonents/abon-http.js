const axios = require('axios');

module.exports = (app) => {
	app.get('/api/ping', async (req, res, next) => {
		res.status(200).json();
	})
	app.get('/api/abonents', async (req, res, next) => {
		try {
			app.queenbridge.abonents.getlist((error, data) => {
				if (error) throw error;
				res.status(200).json({abonents: data});
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'get /api/abonents: ' + error});
		}
	})	
	app.post('/api/register', async (req, res, next) => {
		try {
			req.body.type = "http";
			app.queenbridge.abonents.register(req.body, (error, abon) => {
				if (error) throw error;
				res.status(200).json({id:abon.id});
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'post /api/register: ' + error});
		}
	})
	app.post('/api/unregister', async (req, res, next) => {
		try {
			app.queenbridge.abonents.unregister(req.body, (error) => {
				if (error) throw error;
				res.status(200).json();
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'post /api/unregister: ' + error});
		}
	})
	app.post('/api/send', async (req, res, next) => {
		try {
			app.queenbridge.abonents.send(req.body, (error, report) => {
				if (error) throw error;
				res.status(200).json(report);
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'post /api/send: ' + error});
		}
	})
	app.get('/api/receive/:id', async (req, res, next) => {
		try {
			var params = {
				id: req.params.id,
				ack: false,
				max: req.query.max ? parseInt(req.query.max) : null
			};			
			app.queenbridge.abonents.receive(params, (error, result) => {
				if (error) throw error;
				res.status(200).json({msgs: result});
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'post /api/receive: ' + error});
		}
	})
	app.get('/api/topics', async (req, res, next) => {
		try {
			app.queenbridge.topics.receive(params, (error, result) => {
				if (error) throw error;
				res.status(200).json({msgs: result});
			});			
		}
		catch(error) {
			return res.status(400).json({error: 'post /api/receive: ' + error});
		}
	})	
	app.all('*', async (req, res, next) => {
		res.status(400).json({error: 'not implemented yet'});
	})
}



function Abonents(app) {
   this.abonents = [];

	// finds abonent by id
	this.get = function(id) {
		if (id) {
			for (abon of this.abonents) {
				if (id && abon.id === id) return abon;
			}
		}
		return null;
	}

	this.register = function(data, callback) {
		try {
			if (data.id) {
				var abon = this.get(data.id);
				if (abon) throw `abonent ${data.id} already exists`;
			}
			var abon = {};
			if (data.type === "queen") {
				abon.type = data.type;
				abon.config = data.config;
			}
			else
			if (data.type === "sio") {
			}
			else
			if (data.type === "http") {
			}
			else throw "unknown abonent type"
			this.abonents.push(abon);
			abon.owner = this.abonents;
			return callback(null, abon);
		}
		catch(error) {
			return callback(error, null);
			//if (err) return res.sendStatus(400, error);
		}
	}
}

module.exports.Abonents = Abonents;
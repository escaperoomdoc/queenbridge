
function Topics(app) {
	this.app = app;
	this.topics = app.queenbridge.config.topics ? app.queenbridge.config.topics : [];
	this.get = function(id) {
		if (id) {
			for (topic of this.topics) {
				if (topic.id === id) return topic;
			}
		}
		return null;
	}
	this.getIndex = function(id) {
		if (id) {
			for (index in this.topics) {
				if (this.topics[index].id === id) return index;
			}
		}
		return -1;
	}
	this.getlist = function(callback) {
		try {
			var result = [];
			for (topic of this.topics) {
				result.push({
					id: topic.id,
					subscribers: topic.subscribers
				})
			}
			return callback(null, result);
		}
		catch(error) {
			return callback(error, null);
		}
	}
	this.topic = function(data, callback) {
		try {
			var topic = this.get(data.topic);
			if (topic) throw "topic already exists"
			this.topics.push({
				id: data.topic,
				subscribers: data.subscribers ? data.subscribers : []
			});
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}
	}
	this.untopic = function(data, callback) {
		try {
			var index = this.getIndex(data.topic);
			if (index<0) throw "topic not found"
			this.topics.splice(index, 1);
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}		
	}	
	this.subscribe = function(data, callback) {
		try {
			var topic = this.get(data.topic);
			if (!topic) throw "topic not found";
			topic.subscribers.push(data.id);
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}
	}
	this.unsubscribe = function(data, callback) {
		try {
			var topic = this.get(data.topic);
			if (!topic) throw "topic not found";
			for (index = 0; index < topic.subscribers.length; index++) {
				if (topic.subscribers[index] === data.id) {
					topic.subscribers.splice(index, 1);
					index --;
				}
			}			
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}
	}
	this.publish = function(data, callback) {
		try {
			srcId = data.id;			
			for (msg of data.msgs) {
				var topic = this.get(msg.topic);
				if (!topic) continue;
				for (subscriber of topic.subscribers) {
					this.app.queenbridge.abonents.send({
						id: srcId,
						msgs: [{
							dstId: subscriber,
							msgId: msg.msgId,
							payload: msg.payload,
							options: msg.options
					}]}, (error, report) => {
						if (error) console.log('error on topic publish:' + error);
					});
				}
			}
			return callback(null);
		}
		catch(error) {
			return callback(error);
		}		
	}	
};

module.exports.Topics = Topics;


var Time = require("./time");
var uuid = require("uuid");

var Room = function(io) {

	this.id = uuid.v4();

	this.users = {};

	this.onRoomMessage = function(client, data) {
		switch(data.type) {
			case "time":
				client.user.session.times.push(new Time({time: data.time, penalty: "ok"}));
				io.sockets.in(this.id).emit("times", {name: client.user.name, times: client.user.session.times});
				break;

			default:
				break;
		}
	};

	this.serialize = function() {

		return {id: this.id};
	}
};

module.exports = Room;
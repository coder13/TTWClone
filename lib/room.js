var _ = require('lodash');
var uuid = require('uuid');
var Scramblers = require('../scramblers');

var Room = module.exports = function(io) {
	this.id = uuid.v4();
	this.event = '333';
	this.users = [];
	this.times = [];
	this.io = io;
	
	this.assertDone();
};

Room.prototype.getUser = function (uuid) {
	return _.findWhere(this.users, {uuid: uuid});
};

Room.prototype.onRoomMessage = function (client, data) {
	switch (data.type) {
		case 'time':
			client.user.times.push(new Time({time: data.time}));
			io.sockets.in(this.id).emit('times', {name: client.user.name, times: client.user.times});
			break;
		default:
			break;
	}
};

Room.prototype.addUser = function (user) {
	user.done = true;
	console.log(user.name, 'joined room', this.id);
	this.io.to(this.id).emit('userJoined', user);
	this.users.push(user);

	this.assertDone();
};

Room.prototype.removeUser = function (userUUID) {
	this.io.to(this.id).emit('userLeft', _.findWhere(this.users, {uuid: userUUID}));
	delete _.remove(this.users, {uuid: userUUID});

	// if (_.keys(this.times[this.times.length-1]).length === 1) {// Sucky way to assert no one else has done the scramble
	// 	delete this.times[this.times.length-1];
	// }
}

Room.prototype.addTime = function (userUUID, time) {
	this.times[this.times.length-1][userUUID] = time;
	this.io.to(this.id).emit('newTime', {user: userUUID, time: time});
	this.getUser(userUUID).done = true;

	this.assertDone();
};

Room.prototype.assertDone = function () {
	if (!_.isEmpty(this.users) && _.every(this.users, 'done', true)) {
		var scramble = Scramblers[this.event].getRandomScramble().scramble_string;
		console.log(scramble);
		this.times.push({scramble: scramble});
		this.io.to(this.id).emit('newScramble', scramble);

		this.users.forEach(function (user) {
			user.done = false;
		});
	}
}
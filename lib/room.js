var _ = require('lodash');
var colors = require('colors');
var uuid = require('uuid');
var Scramblers = require('../scramblers');

var Room = module.exports = function() {
	this.id = uuid.v4();
	this.event = '333';
	this.users = [];
	this.times = [];
};

Room.prototype.getUser = function (uuid) {
	return _.findWhere(this.users, {uuid: uuid});
};

Room.prototype.addUser = function (user) {
	user.done = true;
	console.log(user.name.bold, 'joined room', this.id.bold);
	io.to(this.id).emit('userJoined', user);
	this.users.push(user);

	this.assertDone();
};

Room.prototype.removeUser = function (user) {
	io.to(this.id).emit('userLeft', _.findWhere(this.users, {uuid: user}));
	delete _.remove(this.users, {uuid: user});
	this.assertDone();
};

/* add's a time with the user's uuid. If index exists, add to the indexed time, if not, add to current solve. */
Room.prototype.addTime = function (user, time, index) {
	if (!index) {
		index = this.times.length - 1;
	}

	_.set(this.times[index], 'results[' + user + ']', time);
	io.to(this.id).emit('newTime', {user: user, time: time, index: index});
	this.getUser(user).done = true;

	this.assertDone();
};

/* 	Determines if we're done with the current solve. If yes, generate new sramble and move to next solve. */
Room.prototype.assertDone = function () {
	if (!_.isEmpty(this.users)) {
		if (_.every(this.users, 'done', true)) {
			var scramble = Scramblers[this.event].getRandomScramble().scramble_string;
			this.times.push({scramble: scramble, results: {}});

			io.to(this.id).emit('newScramble', scramble);
			console.log('new Scramble', scramble);

			this.users.forEach(function (user) {
				user.done = false;
			});
		}
	} else {
		this.times = _.dropRight(this.times);
	}
};

Room.prototype.update = function () {
	io.to(this.id).emit('syncRoom', {users: room.users, times: room.times});
};

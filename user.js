var User = function() {

	this.name = Math.random() > 0.5 ? 'Bob' : 'Joe';
	this.session = new Session();
};

var Session = function() {

	this.roomId = 0;
	this.times = [];
};

module.exports = User;

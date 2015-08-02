

/* Layout */

// var Header = React.createClass({

// 	render: function () {
// 		return (<div>test</div>);
// 	}

// });
// React.render(<Header/>, document.getElementById('header'));

var timer = new App.Models.Timer({update: 'seconds', accuracy: 2, input: 'timer', inspection: 15, phase: 1});
React.render(<Timer model={timer}/>, document.getElementById('timer'));

var messages = [];
var chat = new App.Collections.Chat(messages);
React.render(<Chat collection={chat}/>, document.getElementById('chatMessages'));
React.render(<ChatInput chat={chat}/>, document.getElementById('chatInput'));

var times = new App.Models.Times();
React.render(<Times model={times}/>, document.getElementById('times'));

timer.addTime = function (time) {
	times.addTime(Me.uuid, time);
}

/* Socket */

var socket = io.connect(window.location.hostname + ':' + window.location.port);


if (socket) {
	var joinRoom = function(room) {
		socket.emit('joinRoom', data.room);
	}

	socket.on('handshakeStart', function (data) {
		// TODO: replace with username and password when user system is implemented.
		var uuid = localStorage.getItem('uuid');
		socket.emit('handshakeUUID', uuid);
	});

	socket.on('handshakeEnd', function (data) {
		Me = data;
		localStorage.setItem('uuid', Me.uuid);

		socket.emit('joinRoom', Me.roomID); // then request to join room.
	});

	socket.on('message', function (data) {
		chat.addMessage(data);
	});

	socket.on('userJoined', function (data) {
		times.addUser(data);
		console.log('blah');
		var name = data.name || data.uuid;
		chat.addMessage({name: 'System', message: name + " Joined!", timeStamp: data.timeStamp});
	});

	socket.on('userLeft', function (data) {
		times.removeUser(data.uuid);
		var name = data.name || data.uuid;
		chat.addMessage({name: 'System', message: name + " Left.", timeStamp: data.timeStamp});
	});

	socket.on('syncRoom', function (data) {
		times.sync(data.users, data.times);
	});

	socket.on('newTime', function (data) {
		times.addTime(data.user, data.time);
	});

	timer.addTime = function (time) {
		timer.enabled = false;
		socket.emit('newTime', {uuid: Me.uuid, time: time});
	}

	socket.on('newScramble', function(data) {
		times.newScramble(data);
		timer.enabled = true;
		$("#scramble").html(data);
	});
}

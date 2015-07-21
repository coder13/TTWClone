

/* Layout */

// var Header = React.createClass({

// 	render: function () {
// 		return (<div>test</div>);
// 	}

// });
// React.render(<Header/>, document.getElementById('header'));

var timer = new App.Models.Timer({update: 'seconds', accuracy: 2, input: 'timer', inspection: 15, phase: 1});
var times = {};
React.render(<Timer model={timer}/>, document.getElementById('timer'));
var timesComponenet = React.render(<Times times={times}/>, document.getElementById('times'));

var messages = [];
var chat = new App.Collections.Chat(messages);
React.render(<Chat collection={chat}/>, document.getElementById('chatMessages'));
React.render(<ChatInput chat={chat}/>, document.getElementById('chatInput'));

/* Socket */

var socket = io.connect(window.location.hostname + ':' + window.location.port);

if (socket) {
	socket.on('handshake', function (data) {

		switch (data.state) {

			case 'START':

				Me = data.client;

				var uuid = localStorage.getItem('uuid');

				Me.uuid = uuid;

				socket.emit('handshake', uuid);

				socket.emit('joinRoom', data.rooms[0].id);

				break;

			case 'ID':

				Me.uuid = data.uuid;

				localStorage.setItem('uuid', Me.uuid);
		}
	});

	socket.on('message', function (data) {
		chat.addMessage(data);
	});

	socket.on('userJoined', function (data) {
		chat.addMessage({name: 'System', message: data.client.user.name + " Joined!", timeStamp: data.timeStamp});
	});

	socket.on('userLeft', function (data) {
		chat.addMessage({name: 'System', message: data.client.user.name + " Left.", timeStamp: data.timeStamp});
	});

	socket.on('times', function(data) {
		times[data.name] = data.times;
		timesComponenet.forceUpdate();
	});
}



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
React.render(<Times times={times}/>, document.getElementById('times'));

/* Socket */

var socket = io.connect(window.location.hostname + ':' + window.location.port);

if (socket) {
	socket.on('handshake', function (data) {
		switch (data.state) {
			case 'START':
				Me = data.client;
				Me.uuid = localStorage.getItem('uuid');

				socket.emit('handshake', Me.uuid);
				socket.emit('joinRoom', data.rooms[0].id);
				break;
			case 'ID':
				Me.uuid = data.uuid;
				localStorage.setItem('uuid', Me.uuid);
				break;
		}
	});

	socket.on('message', function (data) {
		chat.addMessage(data);
	});

	socket.on('userJoined', function (data) {
		console.log(data);
		chat.addMessage({name: 'System', message: data.client.uuid + " Joined!", timeStamp: data.timeStamp});
	});

	socket.on('userLeft', function (data) {
		chat.addMessage({name: 'System', message: data.client.uuid + " Left.", timeStamp: data.timeStamp});
	});

	socket.on('syncTimes', times.syncTimes);
	socket.on('newTime', times.addTime);
}



/* Layout */

// var Header = React.createClass({

// 	render: function () {
// 		return (<div>test</div>);
// 	}

// });
// React.render(<Header/>, document.getElementById('header'));

var timer = new App.Models.Timer({update: 'seconds', accuracy: 2, input: 'timer', inspection: 15, phase: 1});
React.render(<Timer model={timer}/>, document.getElementById('timer'));

var messages = []
var chat = new App.Collections.Chat(messages);
React.render(<Chat collection={chat}/>, document.getElementById('chatMessages'));
React.render(<ChatInput chat={chat}/>, document.getElementById('chatInput'));

/* Socket */

// var socket = io.connect('http://0.0.0.0:8000');
var socket = io.connect(window.location.hostname + ':8080');

if (socket) {
	socket.on('connect', function (data) {
		console.log(arguments);
		if (data)
			Me = JSON.parse(data);
		else
			console.error(data);
	});

	socket.on('message', function (data) {
		chat.addMessage(JSON.parse(data));
	});

	socket.on('userJoined', function (data) {
		data = JSON.parse(data);
		chat.addMessage({name: 'System', message: data.client.name + " Joined!", timeStamp: data.timeStamp});
	});

	socket.on('userLeft', function (data) {
		data = JSON.parse(data);
		chat.addMessage({name: 'System', message: data.client.name + " Left.", timeStamp: data.timeStamp});
	});
}
	
function send(message) {
	if (socket) {
		socket.emit('message', message);
	}
}

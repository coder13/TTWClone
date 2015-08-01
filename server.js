var _ = require('lodash');
var colors = require('colors');
var config = require('getconfig');
var Hapi = require('hapi');
var Room = require('./lib/room');
var routes = require('./routes');
var Scramblers = require('./scramblers');
var uuid = require('uuid');

/*
	Main
*/
var server = new Hapi.Server();
server.connection({
	host: config.Server.Host,
	port: config.Server.Port,
	labels: ['api']
});

// Routes
server.route(routes);

/*
	Chat
*/
var io = require('socket.io')(server.listener);
var clients = {};
var clientCount = 0;
var users = {}; // TODO back end storage for users

var rooms = {};
var mainRoom = new Room(io);
rooms[mainRoom.id] = mainRoom;

io.on('connection', function (socket) {
	try {
		var client = clients[socket.id] = {socketID: socket.id, clientID: clientCount++};

		socket.emit('handshake', {
			state: 'START',
			client: client,
			rooms: _.map(rooms, function(room) {
				return room.serialize();
			})
		});

		socket.emit('message', {type: 'SYSTEM', name: 'System', message: 'Welcome!', timeStamp: Date.now()});

		socket.on('handshake', function (data) {
			if (data) {
				client.uuid = data;
			} else {
				client.uuid = uuid.v4();
				socket.emit('handshake', {state: 'ID', uuid: client.uuid});
			}

			client.user = users[client.uuid];
			console.log(client.uuid, 'connected with id', socket.id.bold, 'with ip:', socket.request.connection.remoteAddress.bold);
			io.sockets.emit('userJoined', {client: client, timeStamp: Date.now()});
		});

		socket.on('message', function (data) {
			if (data[0] === '/') {
				var split = data.slice(1).split(' ');
				var command = split[0];
				var args = split.slice(1);
				switch (command) {
					case 'scramble':
						if (args[0] && Scramblers[args[0]]) {
							var scramble = Scramblers[args[0]].getRandomScramble(null, Math).scramble_string;
							var message = args[0] + ' scramble: ' + scramble;
							io.sockets.emit('message', {type: 'SYSTEM', name: 'System', message: message, timeStamp: Date.now()});
						}
						break;
					default:
						break;
				}
			} else {
				io.sockets.emit('message', {name: client.user.name, message: data, timeStamp: Date.now()});
			}
		});

		socket.on('joinRoom', function(data) {
			socket.join(data);
		});

		socket.on('leaveRoom', function(data) {
			socket.leave(data);
		});

		socket.on('room', function(data) {
			// rooms[client.user.session.roomId].onRoomMessage(client, data);
		});

		socket.on('disconnect', function (data) {
			delete clients[socket.id];
			console.log(socket.id.bold, 'disconnected');
		});
	} catch (e) {
		// uh...need to do this to actually get the errors
		console.error(e.stack);
	}
});

// start server
server.start(function(err) {
	if (err) {
		console.error(err);
	} else {
		console.log('Server started at', colors.green(server.info.uri));
	}
});

var stop = function () {
	console.log('stopping...'.red);
	server.stop();
};

process.on('uncaughtException', stop);
// process.on('SIGTERM', stop);

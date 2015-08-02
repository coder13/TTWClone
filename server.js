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
	Socket
*/
var io = require('socket.io')(server.listener);
var clients = {};
var clientCount = 0;
var users = {};	//	TODO back end storage for users

/* Rooms: */

var rooms = {};
var mainRoom = new Room(io);	//	Single, main room for now.
rooms[mainRoom.id] = mainRoom;

io.on('connection', function (socket) {
	try {
		var client = clients[socket.id] = {socketID: socket.id, clientID: clientCount++, roomID: mainRoom.id};
		client.name = 'guest' + client.clientID;

		/*	Handshake process: Starting by sending a request to the client to get locally stored data
			such as a username and password or a uuid for now. If no local data is found, generate a uuid for the client.
			Then send room data such as current times and list of users.
		*/
		socket.emit('handshakeStart'); // Gimmie yo data

		socket.on('handshakeUUID', function (data) {
			if (data) {
				client.uuid = data;
			} else {
				client.uuid = uuid.v4();
			}
			socket.emit('handshakeEnd', client);

			// client.user = users[client.uuid]; // TODO
			console.log(client.uuid, 'connected with id', socket.id.bold, 'with ip:', socket.request.connection.remoteAddress.bold);
		});

		socket.on('joinRoom', function(data) {
			client.roomID = data;
			socket.join(data);
			room = rooms[client.roomID];
			room.addUser(client);

			socket.emit('syncRoom', {users: room.users, times: room.times});
		});

		socket.on('leaveRoom', function(data) {
			socket.leave(data);
		});

		socket.emit('message', {type: 'SYSTEM', name: 'System', message: 'Welcome!', timeStamp: Date.now()});

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
				io.sockets.emit('message', {name: client.name, message: data, timeStamp: Date.now()});
			}
		});

		socket.on('newTime', function (data) {
			var room = rooms[client.roomID];
			if (room) {
				room.addTime(data.uuid, data.time);
			} else {
				console.error('no room found');
			}
		});

		socket.on('room', function(data) {
			// rooms[client.user.session.roomId].onRoomMessage(client, data);
		});

		socket.on('disconnect', function (data) {
			var room = rooms[client.roomID];
			room.removeUser(client.uuid);
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

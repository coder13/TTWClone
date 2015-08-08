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

/* Socket */

global.io = require('socket.io')(server.listener);

/*	Users */

var clients = {};
var clientCount = 0;
var users = {};	//	TODO back end storage for users

/* Rooms: */

var rooms = {};
var mainRoom = new Room();	//	Single, main room for now.
rooms[mainRoom.id] = mainRoom;

io.on('connection', function (socket) {
	try {
		var client = {socketID: socket.id};

		/*	Handshake process: Starting by sending a request to the client to get locally stored data
			such as a username and password or a uuid for now. If no local data is found, generate a uuid for the client.
			Then send room data such as current times and list of users.
		*/
		socket.emit('handshakeStart'); // Gimmie yo data

		socket.on('handshakeUUID', function (data) {
			client.uuid = data || uuid.v4();
			console.log(client.uuid, 'connected with id', socket.id.bold, 'with ip:', socket.request.connection.remoteAddress.bold);

			if (users[client.uuid]) {
				client = _.extend(users[client.uuid], client); // TODO	for user system
			} else {
				console.log(client.uuid, 'doesn\'t already exist');
				client.name = 'guest' + clientCount++;
				client.roomID = mainRoom.id;
				users[client.uuid] = client;
			}

			socket.emit('handshakeEnd', client);
		});

		socket.on('joinRoom', function(data) {
			client.roomID = !data ? data : mainRoom.id;
			socket.join(data);
			room = rooms[client.roomID];
			if (room) {
				room.addUser(client);
				socket.emit('syncRoom', {users: room.users, times: room.times});
			}

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
					case 'nick':
						client.name = args[0];
						var room = rooms[client.roomID];
						if (room) {
							room.update();
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
			}
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

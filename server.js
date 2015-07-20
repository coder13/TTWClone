var colors = require('colors');
var configuration = require("./configuration");
configuration.validate(); // Make sure everything is ok before we start

var Hapi = require('hapi');
var scramblers = require('./scramblers');
var User = require('./user');
var uuid = require('uuid');
var vantage = require('vantage')();
vantage
	.mode('node')
	.delimiter('node:')
	.init(function (args, cb) {
		console.log('---');
		cb();
	})
	.action(function (command, cb) {
		try {
			console.log(eval(command));
			cb();
		} catch (e) {
			cb();
		}
	});
vantage
	.delimiter('webapp~$')
	.listen(80)
	.show();

/*
		Main
*/
var server = new Hapi.Server();
server.connection({
	host: configuration.host,
	port: configuration.port,
	labels: ['api'],

});

// Serve index.html
server.route({
	method: 'GET',
	path: '/',
	handler: {
		file: 'public/index.html'
	}
});

// Serve everything else
server.route({
	method: 'GET',
	path: '/{param*}',
	handler: {
		directory: {
			path: 'public'
		}
	}
});

/*
		Chat
*/
var io = require('socket.io')(server.listener);
var clients = {}, clientCount = 0;
var users = {'fb537f9c-5583-4c51-b0a0-dca40ca5f594': new User()}; // TODO back end storage for users

io.on('connection', function (socket) {
	try {
		var client = clients[socket.id] = {socketID: socket.id, clientID: clientCount++};

		socket.emit('handshake', {state: "START", client: client});
		socket.emit('message', {type: 'SYSTEM', name: 'System', message: 'Welcome!', timeStamp: Date.now()});

		socket.on('handshake', function (data) {

			if (data) {

				client.uuid = data;
			}

			else {

				client.uuid = uuid.v4();

				socket.emit('handshake', {state: "ID", uuid: client.uuid});
			}

			client.user = users[client.uuid];

			console.log(client.user.name.bold, 'connected with id', socket.id.bold, 'with ip:', socket.request.connection.remoteAddress.bold);

			io.sockets.emit('userJoined', {client: client, timeStamp: Date.now()});
		});

		socket.on('message', function (data) {
			if (data[0] === '/') {
				var split = data.slice(1).split(' ');
				var command = split[0];
				var args = split.slice(1);
				switch (command) {
					case 'scramble':
						if (args[0] && scramblers[args[0]]) {
							var scramble = scramblers[args[0]].getRandomScramble(null, Math).scramble_string;
							var message = args[0] + ' scramble: ' + scramble;
							io.sockets.emit('message', {type: 'SYSTEM', name: 'System', message: message, timeStamp: Date.now()});
						}
						// else
						// 	console.log(86, args, scramblers);
						break;
					default:
						break;
				}
			} else {
				io.sockets.emit('message', {name: client.user.name, message: data, timeStamp: Date.now()});
			}
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
	if (err)
		console.error(err);
	else
		console.log('Server started at', colors.green(server.info.uri));
});

var stop = function () {
	console.log('stopping...'.red);
	server.stop();
};

process.on('uncaughtException', stop);
// process.on('SIGTERM', stop);

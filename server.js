var colors = require('colors');
var configuration = require("./configuration");
configuration.validate(); // Make sure everything is ok before we start

var Hapi = require('hapi'),
	scramblers = require('./scramblers')
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
var io = require('socket.io')(server.listener),
	clients = {}, clientCount = 0;

io.on('connection', function (socket) {
	try {
		var client = clients[socket.id] = {socketID: socket.id, clientID: clientCount++};
		client.name = 'guest' + client.clientID;
		console.log(client.name.bold, 'connected with id', socket.id.bold, 'with ip:', socket.request.connection.remoteAddress.bold);

		socket.emit('handshake', JSON.stringify(client));
		socket.emit('message', JSON.stringify({type: 'SYSTEM', name: 'System', message: 'Welcome!', timeStamp: Date.now()}));

		io.sockets.emit('userJoined', JSON.stringify({client: client, timeStamp: Date.now()}));

		socket.on('message', function (data) {
			var reply;
			if (data[0] === '/') {
				var split = data.slice(1).split(' ');
				var command = split[0];
				var args = split.slice(1);
				switch (command) {
					case 'scramble':
						if (args[0] && scramblers[args[0]]) {
							var scramble = scramblers[args[0]].getRandomScramble(null, Math).scramble_string;
							var message = args[0] + ' scramble: ' + scramble;
							reply = {type: 'SYSTEM', name: 'System', message: message, timeStamp: Date.now()};
							io.sockets.emit('message', JSON.stringify(reply));
						}
						// else
						// 	console.log(86, args, scramblers);
						break;
					default:
						break;
				}
			} else {
				reply = {name: client.name, message: data, timeStamp: Date.now()};
				io.sockets.emit('message', JSON.stringify(reply));
			}
		});

		socket.on('disconnect', function (data) {
			socket.broadcast.emit('userJoined', JSON.stringify({client: client, timeStamp: Date.now()}));
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

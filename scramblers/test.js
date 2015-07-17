var scrambler = require('./scramble_' + (process.argv[2] || '333') + '.js');

scrambler.initialize(null, Math);

for (var i = 0; i < (process.argv[3] || 5); i++) {
	var randomScramble = scrambler.getRandomScramble();
	console.log(randomScramble.scramble_string)
}
var scramblers = require('underscore').extend(require('./scramble_NNN.js'), {
	'333': require('./scramble_333.js'),
	'pyram': require('./scramble_pyram.js'),
	'sq1': require('./scramble_sq1.js'),
	'clock': require('./scramble_clock.js')
});

for (var i in scramblers) {
	scramblers[i].initialize(null, Math);
}

module.exports = scramblers;
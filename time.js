var _ = require("underscore");

/*
 * Constructor takes an object that has
 * time and / or penalty.
 */
var Time = function(timeData) {
	_.defaults(timeData, {time: 0, penalty: "ok"});

	this.time = timeData.time;
	this.penalty = timeData.penalty;

	this.getTime = function() {
		switch (penalty) {

			default:
			case "ok":
				return time;

			case "plus2":
				return time + 2000;

			case "dnf":
				return "DNF";
		}
	};
};

module.exports = Time;
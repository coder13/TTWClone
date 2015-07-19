/*
	Convienence functions:
*/

function now () {
	return (window.performance && window.performance.now
			? window.performance.now.bind(window.performance)
			: Date.now)().toFixed();
}

function pretty (time) {
	if (time < 0)
		return 'DNF';

	time = Math.round(time / 10);
	var bits = time % 100;
	time = (time - bits) / 100;
	var secs = time % 60;
	var mins = ((time - secs) / 60) % 60;

	var out = [bits];
	if (bits < 10) {
		out.push('0');
	}
	out.push('.');
	out.push(secs);
	if (secs < 10 && mins > 0) {
		out.push('0');
	}
	if (mins > 0) {
		out.push(':');
		out.push(mins)
	}
	return out.reverse().join('');
}

var requestAnimationFrame =
    window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(fn) { return window.setTimeout(fn, 1000 / 60); };

var cancelAnimationFrame =
    window.cancelAnimationFrame || window.webkitCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame || window.clearTimeout;


function setInterval(fn, delay) {
	// Have to use an object here to store a reference
	// to the requestAnimationFrame ID.
	var handle = {};

	function interval() {
		fn.call();
		handle.value = requestAnimationFrame(interval)
	}

 	handle.value = requestAnimationFrame(interval);
	return handle;
}

function clearInterval(interval) {
	cancelAnimationFrame(interval.value);
}

// Time
App.Models.Time = Backbone.Model.extend( {
	defaults: {
		time: 0,
		plus2: false,
		DNF: false
	}
});

var Time = React.createClass({
	render: function () {
		return (<span>{pretty(this.props.model.time)}</span>);
	}
});


// Timer

App.Models.Timer = Backbone.Model.extend({
	defaults: {
		accuracy: 2, 		// # of digits displayed after the decimal point
		input: 'timer',		// timer, manual, stackmat
		inspection: 15,		// Amount of inspection in seconds. 15s is WCA
		phase: 1
	},
	active: false,
	time: 0,

	initialize: function (options) {
		if (options.addTime)
			this.addTime = options.addTime;
	},

	start: function () {
		if (!this.active) {
			this.active = true;
			this.time = 0;
			this.started = now();
			this.timerObj = setInterval(_.bind(this.tick, this), 10);
		}
	},

	stop: function() {
		if (this.active) {
			this.active = false;
			clearInterval(this.timerObj);
			if (this.addTime)
				this.addTime(this.time);
		}
	},

	tick: function () {
		this.time = (now() - this.started);
		this.trigger('change', this);
	}
});

var Timer = React.createClass({
	style: {fontSize: '100px', margin: '2px'},
	
	getInitialState: function() {
		return {timing: false, down: false, penalty: "ok"};
	},

	componentDidMount: function() {
		$(document).bind('keyup', _.bind(this.keyUp, this));
		$(document).bind('keydown', _.bind(this.keyDown, this));
		this.props.model.on('change', function () {
			this.forceUpdate();
		}.bind(this));
	},
	
	keyDown: function(e) {
		if (e.keyCode == 32) {
			if (this.timing) {
				this.props.model.stop();
				this.refs.penalties.setState({hidden: false});
			} else if (document.activeElement.id != 'chatInputBox') {
				this.setState({down: true, penalty: "ok"});
				this.refs.penalties.setState({hidden: true});
			}
		} else if (this.timing) {
			this.props.model.stop();
			this.timing = false;
			this.refs.penalties.setState({hidden: false});
		}
		this.render();
	},

	keyUp: function (e) {
		if (e.keyCode == 32) {
			if (!this.timing) {
				if (document.activeElement.id != 'chatInputBox') {
					this.props.model.start();
					this.timing = true;
					this.setState({down: false});
				}
			} else {
				this.timing = false;
			}
		}
		this.render();
	},

	penaltyChange: function(event) {

		console.log(this.state);
		this.setState({penalty: event.target.value});
		console.log(this.props.model.time);
		this.render();
	},

	render: function() {
		var style = {color: this.state.down ? 'green' : (this.state.penalty != "ok" ? 'red' : 'black')};
		return (
			<div>
				<p style={_.extend(style, this.style)}>{pretty(this.state.penalty != "dnf" ? this.props.model.time : -1)}</p>
				<Penalties ref="penalties" penaltyChange={this.penaltyChange}/>
			</div>
		);
	}
});

var Penalties = React.createClass({

	getInitialState: function() {

		return {hidden: true};
	},

	render: function() {

		if (!this.state.hidden) {

			return (
				<div>
					<label>
						<input type="radio" name="penalty" value="ok" onChange={this.props.penaltyChange} defaultChecked="defaultChecked"/>
						OK
					</label>

					<label>
						<input type="radio" name="penalty" value="plus2" onChange={this.props.penaltyChange}/>
						+2
					</label>

					<label>
						<input type="radio" name="penalty" value="dnf" onChange={this.props.penaltyChange}/>
						DNF
					</label>
				</div>
			);
		}

		return false;
	}
});

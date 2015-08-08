App.Models.Times = Backbone.Model.extend({
	times: [],
	currentSolve: {},
	users: [],

	addUser: function (user) {
		if (!_.findWhere(this.users, {uuid: user.uuid})) {
			user.done = true;
			this.users.push(user);
			this.trigger('change', this);
		}
	},

	// Where user is a UUID
	removeUser: function (userUUID) {
		delete _.remove(this.users, {uuid: userUUID});
		this.trigger('change', this);
	},

	// Where user is a uuid
	addTime: function (userUUID, time) {
		if (this.times.length > 0 && !_.findWhere(this.times[this.times.length - 1], {user: userUUID})) {
			this.times[this.times.length - 1][userUUID] = time;
			this.trigger('change', this);
		}
	},

	newScramble: function (scramble) {
		this.times.push({scramble: scramble});
		this.trigger('change', this);
	},

	sync: function (users, times) {
		this.times = times;
		this.users = users;
		this.trigger('change', this);
	}
});

var Times = React.createClass({
	componentDidMount: function() {
		this.props.model.on('change', function () {
			this.forceUpdate();
		}.bind(this));
	},
	render: function() {
		window.requestAnimationFrame(function() {
			var timeContainer = $("#timeContainer")[0];
			timeContainer.scrollTop = timeContainer.scrollHeight;
		});
		var users = this.props.model.users;
		var renderRow = function (row, index) {
			console.log(index + 1);
			return (<tr><td>{index + 1}</td>{users.map(function (user) {
				var time = row[user.uuid];
				console.log(user.uuid, time);
				if (!time) {
					console.log(row);
				}
				return (<td>{time ? pretty(time) : ''}</td>);
			})}</tr>);
		};

		return (
			<div>
				<table id="timeListHeader">
					<tr>
						<th></th>
						{users.map(function (user) {
							return (<th>{user.name || user.uuid || user}</th>);
						})}
					</tr>
				</table>
				<div id="timeContainer">
					<table>
						<tbody>
							{this.props.model.times.map(renderRow)}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
});
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
	addTime: function (userUUID, time, index) {
		var i = index || (this.times.length - 1);
		if (this.times.length > 0 && !_.findWhere(_.get(this.times[i], 'results'), {user: userUUID})) {
			_.set(this.times[i], 'results[' + userUUID + ']', time);
			this.trigger('change', this);
		}
	},

	newScramble: function (scramble) {
		console.log('New scramble:', scramble)
		this.times.push({scramble: scramble, results: {}});
		this.trigger('change', this);
	},

	sync: function (users, times) {
		console.log('Syncing...');
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
			return (<tr><td><div title={row.scramble}>{index + 1}</div></td>{users.map(function (user) {
				var time = _.get(row, 'results[' + user.uuid + ']');
				// console.log(index + 1, user.uuid, row);
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
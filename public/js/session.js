App.Models.Times = Backbone.Model.extend({
	times: [],
	currentSolve: {},
	users: [],

	addUser: function (user) {
		console.log(user);
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
				<table>
					<tr>
						<th> </th>
						{users.map(function (user) {
							return (<th>{user.name || user.uuid || user}</th>);
						})}
					</tr>
					{this.props.model.times.map(renderRow)}
				</table>
			</div>
		);
	}
});

// TODO hover over time and select penalty. This needs to be on Time.
// var Penalties = React.createClass({
// 	getInitialState: function() {
// 		return {hidden: true};
// 	},

// 	render: function() {
// 		var style = {visibility: this.state.hidden ? 'hidden' : 'visible'};
// 		return (
// 			<div style={style}>
// 				<label>
// 					<input type="radio" name="penalty" value="ok" onChange={this.props.penaltyChange} defaultChecked="defaultChecked"/>
// 					OK
// 				</label>
// 				<label>
// 					<input type="radio" name="penalty" value="plus2" onChange={this.props.penaltyChange}/>
// 					+2
// 				</label>
// 				<label>
// 					<input type="radio" name="penalty" value="dnf" onChange={this.props.penaltyChange}/>
// 					DNF
// 				</label>
// 			</div>
// 		);
// 	}
// });

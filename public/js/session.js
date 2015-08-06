App.Models.Times = Backbone.Model.extend({
	times: [],
	users: [],

	addUser: function (user) {
		if (!_.findWhere(this.users, {uuid: user.uuid})) {
			user.done = true;
			this.users.push(user);
			this.trigger('change', this);
		}
	},

	// Where user is a UUID
	removeUser: function (user) {
		delete _.remove(this.users, {uuid: user});
		this.trigger('change', this);
	},

	// Where user is a uuid
	addTime: function (user, time, index) {
		if (!index) {
			index = this.times.length - 1;
			if (this.times.length > 0 && !_.findWhere(this.times[index].results, {user: user})) {
				_.set(this.times[index], 'results[' + user + ']', time);
			}
		}
		this.trigger('change', this);
	},

	newScramble: function (scramble) {
		this.times.push({scramble: scramble, results: {}});

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
			return (<tr title={row.scramble}><td>{index + 1}</td>{users.map(function (user) {
				var time = _.get(row, 'results[' + user.uuid + ']');
				return (<td>{time ? pretty(time) : ''}</td>);
			})}</tr>);
		};

		return (
			<table>
				<thead>
					<tr>
						<th> </th>
						{users.map(function (user) {
						return (<th>{user.name || user.uuid || user}</th>);
						})}
					</tr>
				</thead>
				<tbody>
					{this.props.model.times.map(renderRow)}
				</tbody>
			</table>
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

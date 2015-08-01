App.Models.Times = Backbone.Model.extend({
	times: [
		{'coder13': 10, 'alexM': 20},
		{'coder13': 11},
		{'coder13': 12, 'alexM': 21},
		{'alexM': 23},
		{'coder13': 14, 'alexM': 24},
	],

	currentSolve: {},
	users: ['coder13', 'alexM'],

	addUser: function (user) {
		users.push(user);
		this.render();
	},

	removeUser: function (user) {
		delete users[user];
		this.render();
	},

	addTime: function (data) {
		times[times.length-1] = {user: data.user, time: data.time};
		this.render();
	},

	syncTimes: function(data) {
		if (data) {
			times = data;
			this.render();
		}
	}
});

var Times = React.createClass({
	render: function() {
		var users = this.props.model.users;
		var renderRow = function (row, index) {
			console.log(row, index);
			return (<tr>{users.map(function (user) {
				return (<td>{row[user]}</td>);
			})}</tr>);
		};

		console.log(this.props.model.users);

		return (
			<div>
				<table>
					<tr>
						{this.props.model.users.map(function (user) {
						return (<th>{user}</th>);
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

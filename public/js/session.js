App.Models.Times = Backbone.Model.extend({
	times: {},
	users: {},

	addTime: function (data) {

	},

	syncTimes: function(data) {

	}
});

var Times = React.createClass({

	render: function() {
		var renderRow = function (row, index) {
			
		};

		return (
			<div>
				{console.log()}
				<table>
					<tr>
						<th><b>Times</b></th>
					</tr>
					times.map(renderRow);
					
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

App.Models.ChatLine = Backbone.Model.extend({
	defaults: {
		name: "guest",
		message: "",
		timeStamp: Date.now()
	}
});

var Chatline = React.createClass({
	render: function () {
		return (<p className="chatLine"><span className="chatTime">{new Date(this.props.model.attributes.timeStamp).toLocaleTimeString()}</span>
				<span className="chatName">{this.props.model.attributes.name + ": "}</span>
					<span className="chatMessage">{this.props.model.attributes.message}</span></p>)
	}
});

var ChatInput = React.createClass({
	getInitialState: function () {
		return {text: ''};
	},
	
	send: function (e) {
		if (this.state.text.trim() != '') {
			this.props.chat.sendMessage(this.state.text);
		}
		this.setState({text: ''});
	},

	handleChange: function (e) {
		this.setState({text: e.target.value});
	},

	keyPress: function (e) {
		if (e.which === 13) {
			this.send();
		}
	},
	
	render: function () {
		return (<div id="chatInput">
			<span id="chatInputSpan">
			<input id="chatInputBox" value={this.state.text} onKeyPress={this.keyPress} onChange={this.handleChange} type="text"></input>
			</span>
			<button id="sendChat" onClick={this.send}>Send</button></div>)
	}
});

App.Collections.Chat = Backbone.Collection.extend({
	model: App.Models.ChatLine,

	connect: function (name) {
	},

	leave: function () {
	},

	sendMessage: function (message) {
		socket.emit('message', message);
	},

	addMessage: function (message) {
		this.add(message);
		/*if (this.length > 15) {
			this.shift();
		}*/
	}
});

var Chat = React.createClass({
	componentDidMount: function() {
		this.props.collection.on('add', function (e) {
			this.forceUpdate();
		}.bind(this));
	},

	render: function () {
		var line = function (l) {
			return (<Chatline key={this.props.collection.indexOf(l)} model={l}/>)
		}.bind(this);
		return (<div id="messages">{this.props.collection.map(line)}</div>);
	}
});
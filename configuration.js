var colors = require('colors');

var configuration = {

	host: '0.0.0.0',
	port: 8000
};

/*
 * Called on server start to make sure everything
 * is ok before started everything else
 */

var validate = function() {

	if (!isHost(configuration.host)) {

		console.log(configuration.host.red.bold + ' is not a valid host name.'.red + 'Shutting Down.'.red.bold)

		process.exit();
	}

	if (!isPort(configuration.port)) {

		console.log(String(configuration.port).red.bold + ' is not a valid port.'.red + ' Shutting Down.'.red.bold)

		process.exit();
	}
};

var isPort = function(port) {

	return Number.isInteger(port) && port >= 0 && port <= 65535; // Note that port 0 means just random port but we the os will handle it not us
};

var isHost = function(host) {

	/*
	 * regexs borrowed from http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	 * a modified regex from http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url is used for the url regex
	 *
	 * Note that we are building reg exp objects every time we call this function.
	 * This function is not to be called after the server is initialized
	 */

	var ipv4Regex = new RegExp('^((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$');
	var ipv6Regex = new RegExp('^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$');
	var urlRegex = new RegExp('^[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}$');

	return urlRegex.test(host) || ipv4Regex.test(host) || ipv6Regex.test(host); // Make sure to check for :: special cases
};

module.exports = {

	host: configuration.host,
	port: configuration.port,
	validate: validate,
	isPort: isPort,
	isHost: isHost
};

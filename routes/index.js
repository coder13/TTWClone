module.exports = [
	{	// Serve index.html
		method: 'GET',
		path: '/',
		handler: {
			file: 'public/index.html'
		}
	},
	{	// Serve everything else
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: {
				path: 'public'
			}
		}
	}
];

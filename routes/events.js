const { socket_connections } = require('./../service/socket-sender');
module.exports = function (io) {
	var app = require('express');
	var router = app.Router();

	io.of(`/${process.env.APPNAME}`).on('connection', function (socket) {
		socket.on('client-connect', ({ adminId }) => {
			socket_connections.push({ adminId, socket });
		});

		console.log(
			'user COnnection established with namespace',
			process.env.APPNAME
		);

		socket.emit('ready-client', {
			message: 'Wellcome from server',
		});
	});

	return router;
};

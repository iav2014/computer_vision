/**
 * Created by ariza on 11/2018.
 * personOfInterestStreaming.js using DLIB model && socket.io
 * opencv based face recognition
 * @goal: recognize persons in real time video and send to html canvas using socket.io
 * @use: RealTime monitoring - Access Control - Single factor Authentication
 * @author: Nacho Ariza 2018
 */
const express = require('express');
const http = require('http');
let path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const users = require('./routes/users');
const app = express();
const video = require('./video');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', 3000);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

let server = http.createServer(app);
server.listen(app.get('port'), function () {
	console.log(`App listening on : http://localhost:${app.get('port')}/`);
});

let io = require('socket.io')(server);
io.on('connection', (socket) => {
	console.log('[incoming socket connection]' + socket.id);
	socket.on('disconnect', () => {
		console.log('[socket disconnected]');
	});
});
video.start((err, imgB64) => {
	io.emit('frame', {buffer: imgB64}); // broadcast to all incoming sockets
});
module.exports = app;



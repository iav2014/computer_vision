/**
 * Created by ariza on 08/2020.
 * blurStraming.js using DLIB model && socket.io
 * opencv based face recognition
 * @goal: recognize persons in real time video blur face & send to html canvas using socket.io
 * @use: RealTime monitoring - Access Control - Single factor anonimyzer Authentication
 * @author: Nacho Ariza august of 2020
 */
const express = require('express');
const http = require('http');
let path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
//const users = require('./routes/users');
const app = express();
const video = require('./blurVideo');

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
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
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

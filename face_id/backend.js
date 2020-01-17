/*
wrapper for dlib machine learning features,
FaceDetector:
This face detector is made using the now classic Histogram of Oriented
Gradients (HOG) feature combined with a linear classifier, an image pyramid,
and sliding window detection scheme.  This type of object detector is fairly
general and capable of detecting many types of semi-rigid objects in
addition to human faces.  Therefore, if you are interested in making your
own object detectors then read the fhog_object_detector_ex.cpp example
program.  It shows how to use the machine learning tools which were used to
create dlib's face detector.

This is an example illustrating the use of the deep learning tools from the dlib C++
Library.  In it, we will show how to do face recognition.  This example uses the
pretrained dlib_face_recognition_resnet_model_v1 model which is freely available from
the dlib web site.  This model has a 99.38% accuracy on the standard LFW face
recognition benchmark, which is comparable to other state-of-the-art methods for face
recognition as of February 2017.
    
In this example, we will use dlib to do face clustering.  Included in the examples
folder is an image, bald_guys.jpg, which contains a bunch of photos of action movie
stars Vin Diesel, The Rock, Jason Statham, and Bruce Willis.   We will use dlib to
automatically find their faces in the image and then to automatically determine how
many people there are (4 in this case) as well as which faces belong to each person.
    
Finally, this example uses a network with the loss_metric loss.  Therefore, if you want
to learn how to train your own models, or to get a general introduction to this loss
layer, you should read the dnn_metric_learning_ex.cpp and
dnn_metric_learning_on_images_ex.cpp examples.
    
more info: http://dlib.net/
faceRecognition model : dlib_face_recognition_resnet_model_v1
(c) Nacho Ariza 2018
MIT License
 */
const cv = require('opencv4nodejs');
const https = require('https');
const http = require('http');
const fr = require('face-recognition');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require("body-parser");
const video = require('../streaming/video');
const index = require('../streaming/routes/index');
const config = require('./config/config');

let FaceRecognitor = require('./FaceRecognition/FaceRecognitor');
const https_port = config.app.https_port;
const http_port = config.app.http_port;

const app = express();
// cert to access webcam from outsider,,,
let key = fs.readFileSync(__dirname + '/cert/server.key'); // your server.key && pem files
let cert = fs.readFileSync(__dirname + '/cert/server.pem');
let https_options = {
	key: key,
	cert: cert
};

let encodeJpgBase64 = (img) => {
	return cv.imencode('.jpg', img).toString('base64');
};
let RemoveLastDirectoryPartOf = (the_url) => {
	let the_arr = the_url.split('/');
	the_arr.pop();
	return (the_arr.join('/'));
};
global.basename = RemoveLastDirectoryPartOf(__dirname);
global.directory = __dirname + '/data/';
global.modelFile = config.model.modelFile;
global.recognizer = fr.FaceRecognizer();

app.use(cors());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.static('public'));

// try reading model file
try {
	console.log('-> loading model:', new Date());
	global.model = JSON.parse(fs.readFileSync(global.directory + global.modelFile));
	global.recognizer.load(global.model);
	console.log('--> end loader:', new Date());
} catch (error) {
	console.log('no model file loaded!');
}

// POST training data
app.post('/image', function (req, res) {
	console.log('POST with image');
	if (!req.body.image) {
		console.log('[ERROR] no image field! - 404');
		res.sendStatus(400);
		return;
	}
	if (!req.body.name) {
		console.log('[ERROR] no name field! - 404');
		res.sendStatus(400);
		return;
	}
	let image = req.body.image.split(',')[1];
	let name = global.directory + '/raw/' + req.body.name + '_' +
		Math.floor(new Date() / 1000) + '.png';
	let bitmap = new Buffer.from(image, 'base64');
	fs.writeFileSync(name, bitmap);
	console.log('Saved image to: ' + name)
	res.sendStatus(200);
});

// Process images
app.get('/process', function (req, res) {
	console.log('[process called]');
	FaceRecognitor.processImages(success => {
		res.json({preprocessSuccess: success})
	});
});

// Train the model
app.get('/train', function (req, res) {
	FaceRecognitor.trainModel(success => {
		console.log('Model trained: ', success);
		res.json({'model_trained': success});
	});
});

// Use FaceRecognitor to ask whose fase the image is of
app.post('/prediceBest', function (req, res) {
	console.log('[prediceBest] - service called')
	if (!req.body.image) {
		console.log('[ERROR] no image field! - 404');
		res.sendStatus(400);
		return;
	}
	let image = req.body.image.split(',')[1];
	let bot = req.body.bot;
	let bitmap = new Buffer.from(image, 'base64');
	let [img, players] = FaceRecognitor.prediceBest(bitmap);
	console.log(img, players);
	if (!img) {
		console.log('send false');
		res.json({status: false});
	} else {
		const imgBase64 = encodeJpgBase64(img);
		console.log('prediceBest:', players);
		if (bot) {
			res.json({status: true, img: img, players});
		} else {
			res.json({status: true, imgBase64: imgBase64, players: players});
		}
	}
});


//app.use('/', index);

let https_server = https.createServer(https_options, app).listen(https_port).on('error', (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
}).on('listening', () => {
	console.log(process.pid + ' - https listening on port:' + https_port);
	const io = require('socket.io')(https_server); // only under https_server
	io.on('connection', (socket) => {
		console.log('[incoming socket connection]' + socket.id);
		socket.on('disconnect', () => {
			console.log('[socket disconnected]');
		});
	});
	video.start((err, imgB64) => { // start server socket.io
		io.emit('frame', {buffer: imgB64}); // broadcast to all incoming sockets
	});
});
http.createServer(app).listen(http_port).on('error', (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
}).on('listening', () => {
	console.log(process.pid + ' - http listening on port:' + http_port);
});



/**
 * Created by ariza on 11/2018.
 * personOfInterest2.js using DLIB model
 * opencv based face recognition
 * @goal: recognize persons in real time video
 * @use: RealTime monitoring - Access Control - Single factor Authentication
 * @author: Nacho Ariza 2018
 */
//const fr = require('face-recognition');

const cv = require('opencv4nodejs');

let fr = require('face-recognition').withCv(cv);
let recognizer = fr.FaceRecognizer();
let model = null;
const fs = require('fs');
const minDetections = 10;
const skmoTeam = ['155638', '157877', '165828'];
try {
	console.log('-> loading model:', new Date());
	console.log(__dirname)
	model = JSON.parse(fs.readFileSync(__dirname + '/data/model/' + 'resnet_model.json'));
	
	recognizer.load(model);
	console.log('--> end loader:', new Date());
} catch (error) {
	console.error(error);
	console.error('no model file loaded!');
	process.exit(1);
}

// BLUE/GREEN/RED
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const yellow = new cv.Vec(0, 255, 255);
const blue = new cv.Vec(255, 0, 0);
const white = new cv.Vec(255, 255, 255);
const face_region_color = blue;
const text_color = green;

function draw(frame, faceRect, text, face_region_color, team) {
	const alpha = 0.4;
	const rect = cv.drawDetection(
		frame,
		faceRect,
		{color: face_region_color, segmentFraction: 4}
	);
	let textArray = [];
	if (team) {
		textArray = [{text: 'Expert team', fontSize: 0.5, thickness: 1, color: green},
			{text: '[' + text + ']', fontSize: 0.4, thickness: 1, color: face_region_color}];
	} else {
		textArray = [{text: '[' + text + ']', fontSize: 0.4, thickness: 1, color: yellow}];
	}
	cv.drawTextBox(
		frame,
		new cv.Point(rect.x, rect.y + rect.height + 10),
		textArray,
		alpha
	);
}


const devicePort = 0;
//const vCap = new cv.VideoCapture(devicePort);
console.log(__dirname);
const vCap = new cv.VideoCapture(__dirname+'/video/'+'skype_33.mov');

const delay = 1;
let done = false;
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

function detectFaces(img, faceSize) {
	const {objects, numDetections} = classifier.detectMultiScale(img.bgrToGray())
	return objects
		.filter((_, i) => minDetections <= numDetections[i])
		.map(rect => ({
			rect,
			face: img.getRegion(rect).resize(faceSize, faceSize)
		}))
}

function drawRectWithText(image, rect, text, color) {
	const thickness = 1;
	image.drawRectangle(
		new cv.Point(rect.x, rect.y),
		new cv.Point(rect.x + rect.width, rect.y + rect.height),
		color,
		cv.LINE_4,
		thickness
	);
	
	const textOffsetY = rect.height + 20
	image.putText(
		text,
		new cv.Point(rect.x, rect.y + textOffsetY),
		cv.FONT_ITALIC,
		0.6,
		color,
		thickness
	)
}

const unknownThreshold = 0.6;
let live = (frame) => {
	const faces = detectFaces(frame, 150);
	// mark faces with distance > 0.6 as unknown
	faces.forEach((det) => {
		const {rect, face} = det;
		const cvFace = fr.CvImage(face);
		const prediction = recognizer.predictBest(cvFace, unknownThreshold);
		const text = `${prediction.className} (${prediction.distance})`;
		//drawRectWithText(frame, rect, text, white)
		if (skmoTeam.includes(prediction.className)) {
			draw(frame, rect, text, white, true);
		} else {
			draw(frame, rect, text, white, false);
		}
		console.log(prediction);
	});
	return frame;
};

/*
while (!done) {
	let frame = vCap.read();
	// loop back to start on end of stream reached
	if (frame.empty) {
		vCap.reset();
		frame = vCap.read();
		console.log('empty');
	} else {
		//console.log(frame);frame=frame.resize(480/2,800/2);
		cv.imshow('frame', live(frame.resize(480/2,800/2)));
		const key = cv.waitKey(delay);
	}
	// ...
	//const key = cv.waitKey(delay);
	//done = key !== 255;
};
*/
let recursive = (value) => {
	let frame = vCap.read();
	// loop back to start on end of stream reached
	if (frame.empty) {
		vCap.reset();
		frame = vCap.read();
		console.log('empty');
	} else {
		//console.log(frame);frame=frame.resize(480/2,800/2);
		cv.imshow('frame', live(frame.resize(480/2,800/2)));
		const key = cv.waitKey(delay);
	}
	
	setTimeout(recursive, 1);
};
recursive(1);
/*
setInterval(function () {
	let frame = vCap.read();
	// loop back to start on end of stream reached
	if (frame.empty) {
		vCap.reset();
		frame = vCap.read();
		console.log('empty');
	} else {
		//console.log(frame);frame=frame.resize(480/2,800/2);
		cv.imshow('frame', live(frame.resize(480/2,800/2)));
		const key = cv.waitKey(delay);
	}
	// ...
	//const key = cv.waitKey(delay);
	//done = key !== 255;
	
	
}, 5);


const delay = 1;
let recursive = (value) => {
	let frame = camera.read();
	// loop back to start on end of stream reached
	if (frame.empty) {
		camera.reset();
		frame = camera.read();
		console.log('empty');
	} else {
		cv.imshow('knowlerPoint', detect(frame.resize(480 / 2, 640 / 2)));
		const key = cv.waitKey(delay);
	}
	
	setTimeout(recursive, 1);
};
recursive(1);

*/
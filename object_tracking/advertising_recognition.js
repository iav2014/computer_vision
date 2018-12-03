/**
 * advertising_recognition example
 * this example code using opencv and different classifiers to
 * detect object in video or webcam devices
 * (c) Nacho Ariza Nov 2018
 * MIT License
 */

const cv = require('opencv4nodejs');
const robot_soccer_video = './object_tracking/video/robot_soccer.mp4';
const ball_video = './object_tracking/video/ball.mp4';
const camera = new cv.VideoCapture(robot_soccer_video); // or ball_video
const minDetections = 10;
const classifiers = {
	face: './object_tracking/classifiers/face.xml', // detect human face classifier
	fullbody: './object_tracking/classifiers/fullbody.xml', // detect full body human classifier
	eye: './object_tracking/classifiers/eye.xml', // detect eye classifier
	ball: './object_tracking/classifiers/ball_cascade.xml' // detect adidas 1978 model classifier
};
// cv.CascadeClassifier(0); // 0 to read from webcam device (macosx)
const classifier = new cv.CascadeClassifier(classifiers.ball);
// BLUE/GREEN/RED
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const yellow = new cv.Vec(0, 255, 255);
const blue = new cv.Vec(255, 0, 0);
const white = new cv.Vec(255, 255, 255);
let face_region_color = blue;
let text_color = green;

const detect = function (frame) {
	const result = classifier.detectMultiScale(frame);
	result.objects.forEach((faceRect, i) => {
		if (result.numDetections[i] < minDetections) {
			//console.log(result.numDetections[i], minDetections);
			return;
		}
		const rect = cv.drawDetection(
			frame,
			faceRect,
			{color: yellow, segmentFraction: 4}
		);
	});
	return frame;
};

const delay = 1;
let done = false;
while (!done) {
	let frame = camera.read(detect);
	// loop back to start on end of stream reached
	if (frame.empty) {
		camera.reset();
		frame = camera.read();
		console.log('empty');
	} else {
		cv.imshow('frame', detect(frame.resize(240, 400)));
		const key = cv.waitKey(delay);
	}
}

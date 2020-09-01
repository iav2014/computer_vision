/**
 * faceDetect example
 * detect human face
 * (c) Nacho Ariza Mar 2020
 * MIT License
 */
let beep = require('beepbeep')
const cv = require('opencv4nodejs');
const camera = new cv.VideoCapture(0); // or
const minDetections = 10;
const classifiers = {
	face: './object_tracking/classifiers/face.xml', // detect human face classifier
	fullbody: './object_tracking/classifiers/fullbody.xml', // detect full body human classifier
	eye: './object_tracking/classifiers/eye.xml', // detect eye classifier
	ball: './object_tracking/classifiers/ball_cascade.xml' // detect adidas 1978 model classifier
};
// cv.CascadeClassifier(0); // 0 to read from webcam device (macosx)
const classifier = new cv.CascadeClassifier(classifiers.face);
// BLUE/GREEN/RED
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const yellow = new cv.Vec(0, 255, 255);
const blue = new cv.Vec(255, 0, 0);
const white = new cv.Vec(255, 255, 255);
let face_region_color = blue;
let text_color = green;
let counter = 0;
const detect = function (frame) {
	
	const result = classifier.detectMultiScale(frame);
	
	result.objects.forEach((faceRect, i) => {
		if (result.numDetections[i] < minDetections) {
			//console.log('=>',result.numDetections[i], minDetections, counter);
			return;
		} else {
			counter = 0; // two eye detected, reset counter
			//console.log(faceRect);
			const rect = cv.drawDetection(
				frame,
				faceRect,
				{color: yellow, segmentFraction: 4}
			);
			cv.drawTextBox(
				frame,
				new cv.Point(rect.x, rect.y + rect.height + 5),
				[{text: '[human face]', fontSize: 0.4, thickness: 1, color: yellow}],
				0.4
			);
		}
	});
	
	return frame;
};

const delay = 1;
let done = false;
while (!done) {
	let frame = camera.read(0);
	// loop back to start on end of stream reached
	if (frame.empty) {
		//camera.reset();
		frame = camera.read();
		console.log('empty');
	} else {
		cv.imshow('human face detect', detect(frame.resize(240, 400)));
		const key = cv.waitKey(delay);
	}
}

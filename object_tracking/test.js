/**
 * test example
 * this example code using opencv to test classifier
 * using webcam device
 * (c) Nacho Ariza Nov 2018
 * MIT License
 */
const cv = require('opencv4nodejs');
const camera = new cv.VideoCapture(0); // or
const minDetections = 20;
const classifiers = {
	hand: './object_tracking/classifiers/gun.xml' // detect human face classifier
	
};
// cv.CascadeClassifier(0); // 0 to read from webcam device (macosx)
const classifier = new cv.CascadeClassifier(classifiers.hand);
// BLUE/GREEN/RED
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const yellow = new cv.Vec(0, 255, 255);
const blue = new cv.Vec(255, 0, 0);
const white = new cv.Vec(255, 255, 255);
let face_region_color = blue;
let text_color = green;
let counter = 0;
const detect = (frame) => {
	const result = classifier.detectMultiScale(frame);//detectMultiScale(frame);
	console.log(result);
	
	result.objects.forEach((faceRect, i) => {
		if (result.numDetections[i] < minDetections) {
			//console.log('=>',result.numDetections[i], minDetections, counter);
			return;
		} else {
			const rect = cv.drawDetection(
				frame,
				faceRect,
				{color: yellow, segmentFraction: 1}
			);
		}
		
	});
	
	return frame;
};

const delay = 1;
let done = false;
while (!done) {
	let frame = camera.read();
	// loop back to start on end of stream reached
	if (frame.empty) {
		camera.reset();
		frame = camera.read();
		console.log('empty');
	} else {
		cv.imshow('frame', detect(frame.resize(340, 500)));
		const key = cv.waitKey(delay);
	}
}

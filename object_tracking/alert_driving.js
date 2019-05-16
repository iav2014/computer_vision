/**
 * alert driving example
 * this example code using opencv and eye classifier to detect
 * fatigue while driving (one or two eyes closed)
 * sending beep in  run console mode
 * using webcam device
 * (c) Nacho Ariza Nov 2018
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
const classifier = new cv.CascadeClassifier(classifiers.eye);
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
	//console.log('result.objects.length:',result.objects.length);
	if(counter>10){
		console.log('!!! !!! ALERT BEEP !!! !!!');
		beep(1); // console beep
	}
	if (result.objects.length < 2) { // eyes not detected os one of them closed,,,
		//console.log('counter:' + counter);
		counter++;
	} else { // eyes detected !
		result.objects.forEach((faceRect, i) => {
			if (result.numDetections[i] < minDetections) {
				//console.log('=>',result.numDetections[i], minDetections, counter);
				return;
			} else {
				counter = 0; // two eye detected, reset counter
				const rect = cv.drawDetection(
					frame,
					faceRect,
					{color: yellow, segmentFraction: 4}
				);
			}
			
		});
	}
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
		cv.imshow('frame', detect(frame.resize(340, 500)));
		const key = cv.waitKey(delay);
	}
}

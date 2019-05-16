/**
 * video gun detector example
 * this example code using opencv to test classifier
 * using webcam device
 * (c) Nacho Ariza may 2019
 * MIT License
 */
//const fr = require('face-recognition');

const cv = require('opencv4nodejs');
const minDetections = 35;
const classifiers = {
	gun: './object_tracking/classifiers/gun.xml' // detect human face classifier
	
};
const red = new cv.Vec(0, 0, 255);
const classifier = new cv.CascadeClassifier(classifiers.gun);

//const devicePort = 0;
//const vCap = new cv.VideoCapture(devicePort);
const vCap = new cv.VideoCapture(__dirname + '/video/' + 'gun4_2.mp4');

const delay = 1;
let live = (frame) => {
	const result = classifier.detectMultiScale(frame);//detectMultiScale(frame);
	result.objects.forEach((faceRect, i) => {
		if (result.numDetections[i] < minDetections) {
			//console.log('=>',result.numDetections[i], minDetections, counter);
			return;
		} else {
			//console.log(result);
			console.log('security warning!');
			const rect = cv.drawDetection(
				frame,
				faceRect,
				{color: red, segmentFraction: 1}
			);
		}
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
		cv.imshow('frame', live(frame.resize(480 / 2, 800 / 2)));
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
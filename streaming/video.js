let cv = require('opencv4nodejs');

let camFps = 5;
let camInterval = 1000 / camFps;

// initialize camera
let vCap = new cv.VideoCapture(0);
let delay = 5;
let fr = require('face-recognition').withCv(cv);
//let recognizer = fr.FaceRecognizer();
let recognizer = null;
let model = null;
const TIMEOUT=5000;
const fs = require('fs');
const minDetections = 10;
const skmoTeam = ['155638', '157877', '165828'];
/*
try {
	console.log('-> loading model:', new Date());
	console.log(__dirname)
	model = JSON.parse(fs.readFileSync('/Users/ariza/Documents/codigo/github/computer_vision/face_id/data/model/resnet_model.json'));
	
	recognizer.load(model);
	console.log('--> end loader:', new Date());
} catch (error) {
	console.error(error);
	console.error('no model file loaded!');
	process.exit(1);
}
*/

// BLUE/GREEN/RED
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);
const yellow = new cv.Vec(0, 255, 255);
const blue = new cv.Vec(255, 0, 0);
const white = new cv.Vec(255, 255, 255);
const face_region_color = blue;
const text_color = green;

let draw = (frame, faceRect, text, face_region_color, team) => {
	const alpha = 0.4;
	const rect = cv.drawDetection(
		frame,
		faceRect,
		{color: face_region_color, segmentFraction: 4}
	);
	let textArray = [];
	if (team) {
		textArray = [{text: 'Knowler team', fontSize: 0.5, thickness: 1, color: green},
			{text: '[' + text + ']', fontSize: 0.4, thickness: 1, color: face_region_color}];
	} else {
		textArray = [{text: '[' + text + ']', fontSize: 0.4, thickness: 1, color: yellow}];
	}
	cv.drawTextBox(
		frame,
		new cv.Point(rect.x - 10, rect.y + rect.height + 10),
		textArray,
		alpha
	);
}


const devicePort = 0;

let done = false;
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

let detectFaces = (img, faceSize) => {
	const {objects, numDetections} = classifier.detectMultiScale(img.bgrToGray())
	return objects
		.filter((_, i) => minDetections <= numDetections[i])
		.map(rect => ({
			rect,
			face: img.getRegion(rect).resize(faceSize, faceSize)
		}))
}

let drawRectWithText = (image, rect, text, color) => {
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
};
let alien = [];

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
			alien.push(prediction.className); // alert mode on!
			draw(frame, rect, text, white, true);
		} else {
			draw(frame, rect, text, white, false);
		}
		console.log(prediction);
	});
	return frame;
};

let RemoveLastDirectoryPartOf = (the_url) => {
	let the_arr = the_url.split('/');
	the_arr.pop();
	return (the_arr.join('/'));
}
let start = (callback) => {
	if (recognizer == null) {
		recognizer = fr.FaceRecognizer();
		try {
			console.log('-> loading model:', new Date());
			model = JSON.parse(fs.readFileSync(RemoveLastDirectoryPartOf(__dirname) + '/face_id/data/model/resnet_model.json'));
			recognizer.load(model);
			console.log('--> end loader:', new Date());
		} catch (error) {
			console.error(error);
			console.error('no model file loaded!');
			process.exit(1);
		}
	} else {
		recognizer = global.recognizer;
	}
	
	setInterval(() => {
		let frame = vCap.read();
		// loop back to start on end of stream reached
		if (frame.empty) {
			//vCap.reset();
			frame = vCap.read();
			console.log('empty');
		} else {
			let imgB64 = cv.imencode('.jpg', live(frame.resize(480 / 2, 800 / 2))).toString('base64');
			callback(null, imgB64);
			const key = cv.waitKey(delay);
		}
	}, camInterval);
};
// uniq = [...new Set(array)];
setInterval(() => {
	console.log(...new Set(alien));
	
	
}, TIMEOUT);
module.exports = {
	start
};

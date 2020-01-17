/**
 * Created by ariza on 11/2018.
 * personOfInterest3.js using DLIB model
 * opencv based face recognition
 * @goal: recognize persons in real time video
 * @use: RealTime monitoring - Access Control - Single factor Authentication
 * @demo: use for demo only - identification profiles not in database
 * @author: Nacho Ariza 2018
 */

const argv = require('minimist')(process.argv.slice(2));
console.dir(argv);
const sintax = () => {
	return 'Sintax: node personOfInterest3.js -v video.mov'
}
if (!argv.v) {
	console.log(sintax());
	process.exit(1);
} else {
	if (argv.v===true) {
		console.log('Param error: [no video file]');
		console.log(sintax());
		process.exit(1);
	}
	
}
const config=require('./config/config');
const cv = require('opencv4nodejs');

let fr = require('face-recognition').withCv(cv);
let recognizer = fr.FaceRecognizer();
let model = null;
const fs = require('fs');
const minDetections = 7;
// database simulation with employeeID + names
const skmoTeam = ['angel', 'eladio'];
const teamNames = ['Angel Quesada','Eladio Martinez'];
// end of database simulation
try {
	console.log('-> loading model:', new Date());
	model = JSON.parse(fs.readFileSync(config.data.modelFile));
	
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

function draw(frame, faceRect, employee,name, face_region_color, team) {
	const alpha = 0.4;
	const rect = cv.drawDetection(
		frame,
		faceRect,
		{color: face_region_color, segmentFraction: 4}
	);
	let textArray = [];
	if (team) {
		textArray = [{text: name, fontSize: 0.5, thickness: 1, color: green},
			{text: '[' + employee + ']', fontSize: 0.4, thickness: 1, color: face_region_color}];
	} else {
		textArray = [{text: '[' + employee + ']', fontSize: 0.4, thickness: 1, color: yellow}];
	}
	cv.drawTextBox(
		frame,
		new cv.Point(rect.x-20, rect.y + rect.height + 5),
		textArray,
		alpha
	);
}


const devicePort = 0;
//const vCap = new cv.VideoCapture(devicePort);
console.log(__dirname);
//const vCap = new cv.VideoCapture(__dirname+'/video/'+'skype_33.mov');
const vCap = new cv.VideoCapture(argv.v);

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
let find_person=(employee)=>{
	for(let i=0;i<skmoTeam.length;i++){
		if(skmoTeam[i]===employee){
			return {team:true,employee:employee,name:teamNames[i]};
		}
	}
	return -1;
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
		
		let team=find_person(prediction.className);
		if(team==-1){
			draw(frame, rect, text,'no name', white, false);
		} else {
			draw(frame, rect, text,team.name, white, team.team);
		}
		/*
		if (skmoTeam.includes(prediction.className)) {
			draw(frame, rect, text, white, true);
		} else {
			draw(frame, rect, text, white, false);
		}
		*/
	
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
		cv.imshow('MIT Machine Learning - webinar 2', live(frame.resize(680/2,950/2)));
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
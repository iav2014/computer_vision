/*
test lpbh, eigenfaces,fisherfaces
author: (c) Nacho Ariza 2019
 */


const fs = require('fs');
const path = require('path');
const cv = require('opencv4nodejs');

if (!cv.xmodules.face) {
	throw new Error('exiting: opencv4nodejs compiled without face module');
}
let fsp=path.join(__dirname, '/');
const basePath = fsp+'images';
const imgsPath = path.resolve(basePath, '155638');
let nameMappings  = [];
console.log(imgsPath)
let imgFiles = fs.readdirSync(imgsPath).filter(function (item) {
	return item !== '.DS_Store';
});
nameMappings=imgFiles;
console.log(imgFiles);

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const getFaceImage = (grayImg) => {
	const faceRects = classifier.detectMultiScale(grayImg).objects;
	if (!faceRects.length) {
		throw new Error('failed to detect faces,delete image from array');
		return;
	}
	return grayImg.getRegion(faceRects[0]);
};

const images = imgFiles
// get absolute file path
	.map(file => path.resolve(imgsPath, file))
	// read image
	.map(filePath => cv.imread(filePath))
	// face recognizer works with gray scale images
	.map(img => img.bgrToGray())
	// detect and extract face
	.map(getFaceImage)
	// face images must be equally sized
	.map(faceImg => faceImg.resize(80, 80));

// use images 1 - 3 for training
const trainImages = images;
// use images 4 for testing
let testImages=[];
console.log(__dirname);
let frame = cv.imread(__dirname+'/test/a1.png').resize(80, 80);
const result = frame.bgrToGray();
testImages.push(result);
// make labels
const labels = imgFiles
	.map(file => nameMappings.findIndex(name => file.includes(name)));

const runPrediction = (recognizer) => {
	testImages.forEach((img) => {
		const result = recognizer.predict(img);
		console.log('predicted: %s, confidence: %s', nameMappings[result.label], result.confidence);
		cv.imshowWait('face', img);
		cv.destroyAllWindows();
	});
};

const eigen = new cv.EigenFaceRecognizer();
const fisher = new cv.FisherFaceRecognizer();
const lbph = new cv.LBPHFaceRecognizer();
eigen.train(trainImages, labels);
fisher.train(trainImages, labels);
lbph.train(trainImages, labels);

console.log('eigen:');
runPrediction(eigen);

console.log('fisher:');
runPrediction(fisher);

console.log('lbph:');
runPrediction(lbph);

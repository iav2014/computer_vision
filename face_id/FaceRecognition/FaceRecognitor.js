/*
faceRecognitor module taken from face-scan-app app and
modified by to send image from web page avoiding use tmp directory
and enabling scaling factor using cluster module.
Modified to use opencv+face recognition module to
management opencv pictures and opencv classifiers

(c) Nacho Ariza 2018
MIT License
**/


const fs = require('fs');
const {join} = require('path');

const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv)
const white = new cv.Vec(255, 255, 255);
const alpha = 0.5;

// Processes images from ./data/raw/
// The data should be named as [employeeID]_[uniqueid].png
// Finds player faces from the images and saves the processed images to ./data/processed/[employeeID]/[uniqueid].png
const processImages = (callback) => {
	const dataFolder = global.directory + 'raw';
	fs.readdir(dataFolder, (err, files) => {
		if (err) {
			console.log('Error in reading the raw data folder: ', err);
			callback(false);
		}
		files.forEach(file => {
			console.log(`Processing: ${file}`);
			const filesplit = file.split('.');
			if (filesplit[filesplit.length - 1] === 'png' || filesplit[filesplit.length - 1] === 'jpg') {
				
				//const player = filesplit[0].split('_')[0];
				//const id = filesplit[0].split('_')[1];
				let str = filesplit[0];
				let l = str.split('_');
				let id = null, player = null;
				if (l.length > 2) {
					id = l.pop().split('.')[0];
					player = str.substring(0, str.indexOf(id) - 1);
				} else {
					id = l.pop().split('.')[0];
					player = l[0];
					console.log('id', id, 'player', player);
				}
				
				console.log('player:', player);
				console.log('id:', id);
				const image = fr.loadImage(dataFolder + '/' + file);
				const detector = fr.FaceDetector()
				const targetSize = 150;
				const faceImages = detector.detectFaces(image, targetSize);
				console.log('faceImages', faceImages);
				const savePath = global.directory + `processed/${player}/${id}.png`;
				if (faceImages.length == 0) {
					console.log('can not detect face in this image(will be deleted):',dataFolder + '/' + file);
					try {
						fs.unlinkSync(dataFolder + '/' + file);
					} catch (err) {
						console.log('error delete file', err);
					}
				} else {
					//const savePath = global.directory + `processed/${player}/${id}.png`;
					console.log(`FaceImages: ${faceImages}, saving to ${savePath}`);
					
					if (!fs.existsSync(global.directory + `processed/${player}`)) {
						fs.mkdirSync(global.directory + `processed/${player}`);
					}
					faceImages.forEach((img, i) => fr.saveImage(savePath, img))
				}
				
			}
		});
		callback(true);
	});
}

// Loads the data from ./data/processed/[player]/*.png and trains the model.
// Saves the model to ./data/model.json for later use
const trainModel = (callback) => {
	console.log("Training the model");
	const dataPath = global.directory + 'processed';
	
	const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(join(p, f)).isDirectory())
	
	const faces = {};
	let players = dirs(dataPath);
	let imageTrained = [];
	players.forEach(player => {
		const files = fs.readdirSync(`${dataPath}/${player}`);
		console.log(dataPath);
		console.log(player);
		files.map(file => {
			console.log(file);
			imageTrained.push(player+'_'+file)
		});
		faces[player] = files.map(file => fr.loadImage(`${dataPath}/${player}/${file}`));
	});
	
	// Create & Train the model
	const recognizer = fr.FaceRecognizer();
	
	Object.keys(faces).forEach(function (player, index) {
		const numJitter = 15;
		console.log(`For player ${player}, got ${faces[player].length} faces`);
		recognizer.addFaces(faces[player], player, numJitter);
	});
	fs.writeFileSync(global.directory + '/model/players.json', JSON.stringify(imageTrained));
	
	
	fs.writeFile(global.directory + global.modelFile, JSON.stringify(recognizer.serialize()), err => {
		if (err) {
			console.log('Failed to save model to local file system: ', err);
			callback(false);
		}
		console.log('Model trainer and saved to ' + global.modelFile);
		global.recognizer = recognizer;
		callback(true);
	});
	
	
};


let round = (value, precision) => {
	var multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
};
let draw = (cv, frame, faceRect, text, score) => {
	const rect = cv.drawDetection(
		frame,
		fr.toCvRect(faceRect.rect),
		{color: white, segmentFraction: 4}
	);
	cv.drawTextBox(
		frame,
		new cv.Point(rect.x, rect.y + rect.height + 10),
		[{text: text, fontSize: 0.5, thickness: 1, color: white},
			{text: 'score ' + round(score, 2), fontSize: 0.5, thickness: 1, color: white}],
		alpha
	);
	return frame;
};


// Predicts the player
// Loads a presaved model from ./data/model.json
const prediceBest = (bitmap) => {
	let imageCvMat = cv.imdecode(bitmap);
	let imageCv = fr.CvImage(imageCvMat)
	//const imageRGB = fr.loadImage(global.directory + 'tmp/tmp.png');
	const imageRGB = fr.cvImageToImageRGB(imageCv);
	const detector = fr.FaceDetector();
	const targetSize = 150;
	let prediceBestArray = [];
	// Assume only one face in the picture
	let faces = detector.detectFaces(imageRGB, targetSize);
	console.log('1', faces.length);
	if (faces.length === 0) {
		return [false, false];
	} else {
		const faceRects = detector.locateFaces(imageCv);
		faces.forEach((face, i) => {
			console.log('i:', i, 'face:', JSON.stringify(face));
			if (face == undefined) {
				imageCvMat = false;
				prediceBestArray = false;
				return [imageCvMat, prediceBestArray];
			} else {
				console.log('->', new Date());
				let prediceBest = global.recognizer.predictBest(face);
				if (prediceBest != undefined) {
					console.log('-->', new Date());
					console.log(prediceBest.className,prediceBest.distance);
					if (prediceBest.distance > 0.60) {
						prediceBestArray.push({"className": 'Unknown', distance: prediceBest.distance});
						imageCvMat = draw(cv, imageCvMat, faceRects[i], 'Unknown', prediceBest.distance);
					} else {
						imageCvMat = draw(cv, imageCvMat, faceRects[i], prediceBest.className, prediceBest.distance);
						prediceBestArray.push(prediceBest);
					}
				} else {
					console.log('no model trained!');
					imageCvMat = false;
					prediceBestArray = false;
					return [imageCvMat, prediceBestArray];
				}
			}
		});
		//cv.imshowWait('result', imageCvMat);
		return [imageCvMat, prediceBestArray];
	}
};

module.exports = {
	processImages,
	trainModel,
	prediceBest
} 

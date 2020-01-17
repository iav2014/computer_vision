/*
re-train model
goal:
use this feature to incremental train, only if there are new images on the dataset.
create players.json and model if those files doesnt exist
author: (c) Nacho Ariza jan 2020
**/
'use strict';
const fs = require('fs');
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);
const async = require('async');
const config = require('../config/config');
/*
Step1 - waterfall
nip compare to player.json
get new employee images and compare to model stored images
Goal: see image changes between new images & trained image model
**/
let step1 = (data, callback) => {
	console.log('step1');
	let rawFiles = fs.readdirSync(data.rawFolder).filter(function (item) {
		return item.indexOf('.png') > 0;
	});
	try {
		if (fs.existsSync(data.trainedFolder)) {
			console.log('exist');
			
		} else {
			// file not exist create it
			const fd = fs.openSync(data.trainedFolder, 'w');
			
		}
		let trainedPlayers = [];
		try {
			trainedPlayers = JSON.parse(fs.readFileSync(data.trainedFolder, 'UTF-8'));
		} catch (err) {
			console.log('no file in:'+data.trainedFolder+' create it');
		}
		
		let nip = [];
		for (let i = 0; i < rawFiles.length; i++) {
			let old = trainedPlayers.includes(rawFiles[i]);
			if (!old) {
				nip.push(rawFiles[i])
				console.log('not in image training dataset', rawFiles[i])
			}
		}
		data.trainedPlayers = trainedPlayers;
		data.nip = nip;
		if (nip.length === 0) {
			data.status = 'not new image on training dataset';
			// not new image on training dataset
			return callback(true, data)
		} else {
			return callback(null, data);
		}
	} catch (err) {
		return callback(true, err);
	}
	
};
/*
Step2 - waterfall
raw to process data directory
move new imaged face detected to process directory
Goal: face detector to generate processed image
**/
let step2 = (data, callback) => {
	console.log('step2');
	const files = data.nip;
	let error = [];
	
	let recognizer = fr.FaceRecognizer();
	let model = null;
	try {
		model = JSON.parse(fs.readFileSync(data.modelFile));
		recognizer.load(model);
	} catch (err) {
		model=fs.openSync(data.modelFile, 'w')
	}
	
	
	
	data.recognizer = recognizer;
	let newPlayers = [];
	files.forEach(file => {
		
		let l = file.split('_');
		let id = null, player = null;
		if (l.length > 2) {
			id = l.pop().split('.')[0];
			player = str.substring(0, str.indexOf(id) - 1);
		} else {
			id = l.pop().split('.')[0];
			player = l[0];
			newPlayers.push(player);
		}
		
		console.log(`id:${id},player:${player}`);
		
		const image = fr.loadImage(data.rawFolder + '/' + file);
		const detector = fr.FaceDetector();
		const targetSize = config.faceSize; // 150x150 pixeles for detect Face
		const faceImages = detector.detectFaces(image, targetSize);
		const savePath = data.processedFolder + `/${player}/${id}.png`;
		if (faceImages.length === 0) {
			console.log('can not detect face in this image(will be deleted):', data.rawFolder + '/' + file);
			try {
				fs.unlinkSync(data.rawFolder + '/' + file);
			} catch (err) {
				console.log('error delete file', err);
				error.push(err);
			}
		} else {
			//const savePath = global.directory + `processed/${player}/${id}.png`;
			console.log(`FaceImages: ${faceImages}, saving to ${savePath}`);
			try {
				if (!fs.existsSync(data.processedFolder + `/${player}`)) {
					fs.mkdirSync(data.processedFolder + `/${player}`);
				}
				faceImages.forEach((img, i) => {
					fr.saveImage(savePath, img);
				});
				
			} catch (err) {
				error.push(err);
			}
		}
	});
	if (error.length === 0) {
		data.newPlayers = newPlayers;
		return callback(null, data);
	} else {
		console.log(2);
		data.status = 'error in file(s) processed';
		return callback(true, error);
	}
};
/*
* incremental training
* Goal:get all new employee images images and add to model in memory
**/
let step3 = (data, callback) => {
	console.log('step3');
	let faces = {};
	let unique = [...new Set(data.newPlayers)];
	console.log('unique', unique);
	unique.forEach(player => {
		let files = fs.readdirSync(data.processedFolder + `/${player}`);
		console.log(files);
		faces[player] = files.map(file => {
			let r = data.processedFolder + `/${player}/${file}`;
			console.log('read:', r);
			return fr.loadImage(r);
		});
		console.log(`For player ${player}, got ${faces[player].length} faces`);
		data.recognizer.addFaces(faces[player], player, data.numJitter);
	});
	console.log('after addFaces & done!');
	return callback(null, data);
};
/*
* write model to file system
* Goal: add new image files to actual model
**/
let step4 = (data, callback) => {
	fs.writeFile(data.modelFile, JSON.stringify(data.recognizer.serialize()), err => {
		if (err) {
			console.log('Failed to save model to local file system: ', err);
			data.status = 'Failed to save model:' + data.modelFile;
			return callback(true, err);
		} else {
			console.log('Model trainer and saved to ' + data.modelFile);
			callback(null, data);
		}
	});
};
/*
* write new image files
* Goal: save all new images and add to trained players
**/
let step5 = (data, callback) => {
	console.log('step5');
	console.log('data.trainedPlayers',data.trainedPlayers);
	console.log('data.trainedPlayers',data.nip);
	console.log('data.trainedFolder',data.trainedFolder);
	Array.prototype.push.apply(data.trainedPlayers, data.nip);
	
	try {
		fs.writeFileSync(data.trainedFolder, JSON.stringify(data.trainedPlayers));
		callback(null, data);
	} catch (err) {
		console.error(err);
		data.status = 'Failed to save image dataset array at:' + data.trainedFolder;
		callback(true, err);
	}
	
}

let start = (data, callback) => {
	let configuration = {};
	configuration.directory = config.directory;
	configuration.rawFolder = config.data.rawFolder;
	configuration.trainedFolder = config.data.trainedFolder;
	configuration.modelFile = config.data.modelFile;
	configuration.processedFolder = config.data.processedFolder;
	configuration.numJitter = config.data.numJitter;
	configuration.faceSize = config.data.faceSize;
	console.log(configuration)
	let startTime = Date.now();
	async.waterfall([
			async.apply(step1, configuration),
			step2,
			step3,
			step4,
			step5
		], function (err, result) {
			if (err) {
				callback(err, {
					error: err,
					results: result,
					duration: (Date.now() - startTime) / 1000
				});
			} else {
				callback(err, {
					error: err,
					results: result,
					duration: (Date.now() - startTime) / 1000
				});
			}
			
		}
	);
}


start({}, function (err, result) {
	if (err) {
		console.log(result);
	} else {
		console.log(result);
		console.log('this is the end!');
	}
});


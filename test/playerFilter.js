const fs = require('fs');
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);


const rawFolder = '/Users/ariza/Documents/codigo/github/computer_vision/face_id/data/raw';
const trainedFolder = '/Users/ariza/Documents/codigo/github/computer_vision/face_id/data/model/players.json';

let RemoveLastDirectoryPartOf = (the_url) => {
	let the_arr = the_url.split('/');
	the_arr.pop();
	return (the_arr.join('/'));
};
global.basename = RemoveLastDirectoryPartOf(__dirname);

global.directory = '/Users/ariza/Documents/codigo/github/computer_vision/face_id/';
global.modelFile = 'model/resnet_model.json';
global.recognizer = fr.FaceRecognizer();
console.log(__dirname)
/*
global.basename = RemoveLastDirectoryPartOf(__dirname);
global.directory = __dirname + '/data/';
global.modelFile = 'model/resnet_model.json';
global.recognizer = fr.FaceRecognizer();
*/
let new_image_players = (rawFolder, trainedFolder) => {
	let rawFiles = fs.readdirSync(rawFolder).filter(function (item) {
		return item.indexOf('.png') > 0;
	});
	let trainedPlayers = JSON.parse(fs.readFileSync(trainedFolder, 'UTF-8'));
	let newFiles = [];
	for (let i = 0; i < rawFiles.length; i++) {
		let old = trainedPlayers.includes(rawFiles[i]);
		if (!old) {
			newFiles.push(rawFiles[i])
			console.log('not in image training dataset', rawFiles[i])
		}
	}
	return newFiles;
};
let nip = new_image_players(rawFolder, trainedFolder);
console.log('new_image_players', nip);


const retrainModel = (files, callback) => {
	let recognizer = fr.FaceRecognizer();
	let model = JSON.parse(fs.readFileSync(global.directory +'/data/'+ global.modelFile));
	recognizer.load(model);
	const dataFolder = global.directory +'/data/'+ 'raw';
	let newPlayers=[];
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
		
		const image = fr.loadImage(rawFolder + '/' + file);
		const detector = fr.FaceDetector();
		const targetSize = 150;
		const faceImages = detector.detectFaces(image, targetSize);
		//console.log(faceImages);
		
		const savePath = global.directory+'/data/' + `processed/${player}/${id}.png`;
		if (faceImages.length === 0) {
			console.log('can not detect face in this image(will be deleted):', dataFolder + '/' + file);
			try {
				fs.unlinkSync(dataFolder + '/' + file);
			} catch (err) {
				console.log('error delete file', err);
			}
		} else {
			//const savePath = global.directory + `processed/${player}/${id}.png`;
			console.log(`FaceImages: ${faceImages}, saving to ${savePath}`);
			
			if (!fs.existsSync(global.directory +'/data/'+ `processed/${player}`)) {
				fs.mkdirSync(global.directory +'/data/'+ `processed/${player}`);
			}
			faceImages.forEach((img, i) => {
				fr.saveImage(savePath, img);
			});
		}
	});
	let faces={};
	let unique = [...new Set(newPlayers)];
	console.log('unique',unique)
	unique.forEach(player=>{
		let files = fs.readdirSync(global.directory +'/data/'+ `processed/${player}`);
		console.log(files);
		faces[player] = files.map(file => {
				console.log('read:',global.directory +'/data/'+ `processed/${player}/${file}`)
				return fr.loadImage(global.directory +'/data/'+ `processed/${player}/${file}`)
		});
		let numJitter = 15;
		//console.log(faces);
		console.log(`For player ${player}, got ${faces[player].length} faces`);
		recognizer.addFaces(faces[player], player,numJitter);
	})
	console.log('after addFaces & done!');
	/*
	fs.writeFile(global.directory + '/data/'+global.modelFile, JSON.stringify(recognizer.serialize()), err => {
		if (err) {
			console.log('Failed to save model to local file system: ', err);
			return callback(false);
		} else {
			console.log('Model trainer and saved to ' + global.modelFile);
		}
	});
	*/
	return callback(true);
};
retrainModel(nip, (err) => {
	console.log(err);
});




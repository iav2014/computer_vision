const env = process.env.FI3 || 'local';
const directory = process.env.DIRECTORY || '/Users/ariza/Documents/codigo/github/computer_vision';
module.exports = {
	app: {
		http_port: process.env.HTTP_PORT || 8080,
		https_port: process.env.HTTPS_PORT || 3000,
		anagram: process.env.ANAGRAM || '/fi3',
	},
	model: {
		modelFile: process.env.MODELFILE || 'model/resnet_model.json'
	},
	data: {
		directory: directory,
		rawFolder: directory + (process.env.RAW || '/face_id/data/raw'),
		processedFolder: directory + (process.env.PROCESSED || '/face_id/data/processed'),
		trainedFolder: directory + (process.env.PLAYERS || '/face_id/data/model/players.json'),
		modelFile: directory + (process.env.MODELFILE || '/face_id/data/model/resnet_model.json'),
		numJitter: process.env.JITTER || 15, // 15 different images x each user image, training more slow
		faceSize: process.env.SIZE || 150 // x*y face image size
	}
	
}
;

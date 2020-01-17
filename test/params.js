var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);
const sintax = () => {
	return 'Sintax: node params.js -v video.mov'
}
if (!argv.v) {
	console.log(sintax());
} else {
	if (argv.v===true) {
		console.log('Param error: [no video file]');
		console.log(sintax());
	} else {
		console.error('params:' + argv.v);
	}
	
}
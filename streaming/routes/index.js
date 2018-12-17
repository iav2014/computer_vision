const express = require('express');
const path = require('path');
const router = express.Router();
const cv = require('opencv4nodejs');
// camera properties
/* GET home page. */
router.get('/', function (req, res, next) {
	console.log('===>',path.join(__dirname, '../public/index3.html'));
	res.sendFile(path.join(__dirname, '../public/index3.html'));
});
module.exports = router;

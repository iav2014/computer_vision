// MODIFY THIS TO THE APPROPRIATE URL IF IT IS NOT BEING RUN LOCALLY
// (c) Nacho 2018
var socket = io.connect(window.location.href);

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var img = new Image();

// show loading notice
context.fillStyle = '#333';
context.fillText('Loading...', canvas.width / 2 - 30, canvas.height / 3);

socket.on('frame', function (data) {
    console.log('receiving...');
	var base64String = data.buffer;
    img.onload = function () {
        context.drawImage(this, 0, 0, canvas.width, canvas.height);
    };
    img.src = 'data:image/jpg;base64,' + base64String;
});
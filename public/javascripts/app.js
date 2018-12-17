// MODIFY THIS TO THE APPROPRIATE URL IF IT IS NOT BEING RUN LOCALLY
const endPoint=window.location.href.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
const socket = io.connect(endPoint);
const canvas = document.getElementById('canvas-video');
const context = canvas.getContext('2d');
let img= new Image();

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
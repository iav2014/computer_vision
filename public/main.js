
$( document ).ready(function() {
		var maxDim = 1000;
		function getImageDisplayScale(img) {
			var w = img.width;
			var h = img.height;

			var scale = 1.0;
			if (w > h) {
				scale = maxDim / w;
			} else {
				scale = maxDim / h;
			}

			if (scale < 1.0) {
				w = w * scale;
				h = h * scale;
			}
			return ({width: w, height: h});
		}

		function displayImage(imageId, imageData) {
			var imgEl = document.getElementById(imageId);

			// rescale displayed image if it is too large
			var img = new Image();
			img.onload = function (e) {
				var img = e.target;
				var scaledDims = getImageDisplayScale(img);
				imgEl.src = imageData;
				imgEl.width = scaledDims.width;
				imgEl.height = scaledDims.height;
			};
			img.src = imageData;
		}

		function dodrop(event) {
			var dt = event.dataTransfer;
			var files = dt.files;
			var count = files.length;

			var reader = new FileReader();
			reader.onload = function (e) {
				var image = new Image();
				image.onload = function () {
					video = document.getElementById('webcamvideo');
					var canvas = document.getElementById('facephoto');
					canvas.width = video.offsetWidth;
					canvas.height = video.offsetHeight;

					var tempcontext = canvas.getContext("2d"),
						tempScale = (canvas.height / canvas.width);

					tempcontext.drawImage(
						image,
						0, 0,
						video.offsetWidth, video.offsetHeight
					);

					$.post("/prediceBest", {image: canvas.toDataURL('image/png')}, function (data) {
						console.log("Post success: ", data);
						document.getElementById('detectedname').innerHTML = "IT IS " + data.playerName.className;
					});
				};
				image.src = reader.result;
			}
			reader.readAsDataURL(files[0]);


		}

		var videoObj = {"video": true},
			errBack = function (error) {
				alert("Video capture error: ", error.code);
			};

		function record(callback){

		
			// Ask the browser for permission to use the Webcam
			if (navigator.getUserMedia) {                    // Standard
				navigator.getUserMedia(videoObj, startWebcam, errBack);
			} else if (navigator.webkitGetUserMedia) {        // WebKit
				navigator.webkitGetUserMedia(videoObj, startWebcam, errBack);
			} else if (navigator.mozGetUserMedia) {        // Firefox
				navigator.mozGetUserMedia(videoObj, startWebcam, errBack);
			};

			function startWebcam(stream) {
				var myOnlineCamera = document.getElementById('myOnlineCamera'),
					video = document.getElementById('webcamvideo'),
					canvas = document.getElementById('facephoto');
					video.width = video.offsetWidth;
					if (navigator.getUserMedia) {                    // Standard
						video.srcObject = stream;
						video.play(video);
						console.log(video)
						callback(video);
					} else if (navigator.webkitGetUserMedia) {        // WebKit
						video.srcObject = window.webkitURL.createObjectURL(stream);
						video.play();
						console.log(video)
						callback(video);
					} else if (navigator.mozGetUserMedia) {        // Firefox
						video.srcObject = window.URL.createObjectURL(stream);
						video.play();
						console.log(video)
						callback(video);
					};
				}
		}
		
			document.getElementById('recognizeTab').addEventListener('click', () => {
				$("#display").show();
				let testVideo = document.getElementById('webcamvideo')
				if (!testVideo.srcObject){
					record((video)=>{
					});
				}
					
			});


			let playBtn = document.getElementById('playwebcam').addEventListener('click', () => {	
				if($("#playwebcam").hasClass('unabled')){
					$("#namefield").addClass("empty");
					return;
				}
				$(".logs").hide();
					let testVideo = document.getElementById('webcamvideo')
					if (testVideo.srcObject){
						play(testVideo);
						$("#display").show();
					}else{
						record((video)=>{
							play(video);
							$("#display").show();
						});
					}

			})
		


		 function play(video){
				$("#samples").html("");
				setTimeout(()=>{
					$("#prompt").html("MOVE YOUR HEAD SLIGHTLY");
						setTimeout(()=>{
							$("#prompt").html("");
							startCapture(video);
						},1000)
				},2000)
		 }

      function startCapture(video) {
        let count = 0;
        let interval = setInterval(()=>{
          if (count < 10){
            $("#flash").show();
            setTimeout(()=>{
              $("#flash").hide();
            },200);
            takephoto(video);
            count++;
          }else{
            clearInterval(interval);
            $("#prompt").html("FINISH");
          }
        },1000);
      }

			// Click to take the photo
			function takephoto (video){
				var canvas = document.getElementById('facephoto');

				canvas.width = video.offsetWidth;
				canvas.height = video.offsetHeight;

				var tempcontext = canvas.getContext("2d"),
					tempScale = (canvas.height / canvas.width);

				tempcontext.drawImage(
					video,
					0, 0,
					video.offsetWidth, video.offsetHeight
        );
        let img_url = canvas.toDataURL('image/png');
        var img = $('<img id="dynamic">');
        img.attr('src', img_url);
        img.appendTo('#samples');

				$.post("/image", {
					image: canvas.toDataURL('image/png'),
					name: document.getElementById('namefield').value
				}, function (data) {
					console.log("Post success: " + data);
				});

			}

			// Click to take the photo
			document.getElementById('prediceBest').addEventListener('click', () => {
				var canvas = document.getElementById('facephoto');
				document.getElementById('detectedname').innerHTML = null;
				let video = document.getElementById('webcamvideo')
				canvas.width = video.offsetWidth;
				canvas.height = video.offsetHeight;

				var tempcontext = canvas.getContext("2d"),
					tempScale = (canvas.height / canvas.width);

				tempcontext.drawImage(
					video,
					0, 0,
					video.offsetWidth, video.offsetHeight
				);

				$.post("/prediceBest", {image: canvas.toDataURL('image/png')}, function (data) {
					var str = '';
					for (let i = 0; i < data.players.length; i++) {
						if (i > 0) str += ',';
						str = str + data.players[i].className;
					}
					;
					let imgBase64 = data.imgBase64;
					displayImage('output', 'data:image/jpeg;base64,' + imgBase64);
					$("#output").show();
					document.getElementById('detectedname').innerHTML = "[" + str + "]";
				});

			});

			document.getElementById('normalize').addEventListener('click', () => {
				$("#spinner").show();

				$.get("/process", {}, function (data) {
					$("#spinner").hide();
					$("#normalized").show();

					console.log("Get success: " + data);
				});

			})

			document.getElementById('train').addEventListener('click', () => {
				$("#spinner").show();

				$.get("/train", {}, function (data) {
					console.log("Get success: " + data);
					$("#trained").show();
					$("#spinner").hide();
				});

			})

			$("#trainTab, #logo").click(()=>{
				$(".tab2").hide();
				$("#display").hide();
				$("#display").removeClass("recognitionCam");
				$(".tab1").show();
				$("#trainTab").addClass("selected");
				$("#recognizeTab").removeClass("selected");
			});


			$("#recognizeTab").click(()=>{
				$(".tab2").show();
				$("#display").addClass("recognitionCam");
				$(".tab1").hide();
				$("#recognizeTab").addClass("selected");
				$("#trainTab").removeClass("selected");
			});
			$('#namefield').bind('input', function() { 
				if($(this).val().length > 5){
					$("#playwebcam").removeClass("unabled");
					$('#namefield').removeClass("empty");
				}else{
					$("#playwebcam").addClass("unabled");
				}
		});
		
});

const fs = require('fs');
const cv = require('opencv4nodejs');

const l = console.log.bind(console);

/*
const variation = (mat) => {
	const meanMat =  mat.mean();
	const diffMat = mat.sub(meanMat);
	
	const [w, h] = diffMat.sizes;
	let total = 0;
	for(let x = 0; x < w; x++){
		for(let y = 0; y < h; y++){
			const v = diffMat.at(x,y);
			total += v*v;
		}
	}
	
	return Math.sqrt(total / (w * h));
};

const files = fs.readdirSync('test/images');
l(files);



files.filter(f => f.indexOf('.jpg') > 0)
	.forEach(f => {
		
		l(`processing ${f}`);
		const image = cv.imread(`test/images/${f}`);
		const gray = image.cvtColor(cv.COLOR_BGR2GRAY);
		const laplacian = gray.laplacian(cv.CV_64F);
		
		//l(laplacian.std);
		//
		cv.imwrite(`test/output/laplacian_${f}`, laplacian);
		const v = variation(laplacian);
		image.putText(
			Math.round(v).toString(),
			new cv.Point2(5, 25),
			cv.FONT_HERSHEY_SIMPLEX,
			0.7,
			new cv.Vec3(0, 0, 255),
			0, 20
		)
		cv.imwrite(`test/output/${f}`, image);
		
	});

return;


const laplacian = (image) => {
	cv.laplacian()
};

const image = cv.imread()


console.log(cv);

 */


let clone = (image) => {
	let newFrame = image.getRegion(new cv.Rect(0, 0, image.cols, image.rows)).cvtColor(cv.COLOR_BGR2RGBA);
	let imageROI = newFrame.getRegion(new cv.Rect(0, 0, image.cols, image.rows));
	let newImg = image.copyTo(imageROI, image);
	return newImg;
}

let cloneImage = (image, callback) => {
	let region = image.getRegion(new cv.Rect(50, 50, image.cols - 50, image.rows - 50));
	return callback(null, region);
}

let modifyImage = (image, rect) => {
	//const imageData = new Array((image.rows * image.cols))
	let mdImg = clone(image);
	let row, col = 0;
	for (row = 0; row < image.rows; row++) {
		if ((row >= rect.y) && (row <= rect.y+rect.height)) {
			for (col = 0; col < image.cols; col++) {
				//imageData[index] = image.at(row, col);
				if ((col >= rect.x) && (col <= rect.x+rect.width)) {
					mdImg.set(row, col, [0, 0, 0]);
				}
				//let [b, g, r] = image.atRaw(row, col);
				//mdImg.set(row, col, [r, g, b]);
			}
			
			
		}
		
	}
	return [image, mdImg];
}

// ----------------------------------------------------
// Rect { height: 116, width: 116, y: 66, x: 192 }
const f = 'rosa.jpg';
const image = cv.imread(`test/images/${f}`);
const rect = {height: 116, width: 116, y: 66, x: 192};
let [img, mod] = modifyImage(image, rect);
cv.imwrite(`test/output/original_${f}`, img);
cv.imwrite(`test/output/modify_${f}`, mod);


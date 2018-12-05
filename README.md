**nodejs computer vision example**

this example code using OpenCV to recognize some objects in video movie.
Thanks for Ball cascade model: 
(https://github.com/dbloisi/detectball/blob/master/ball_cascade.xml)

advertising_recognition.js
Design Choices
 

The architecture I used for this application has been chosen to make it work without any 
kind of cloud dependency (cognitive services). 

Goal
nodejs source takes images from web cam devices or video movies, split in images and call
process to detect objects in this image, inside a loop.

a possible use of this code would be to detect advertisements in videos or images, 
and be able to count the time spent on screen of the same, or it can be used for a 
facial recognition system .

Thanks for Sapienza Università di Roma for robot_soccer.mp4 video os SPQR Robot Soccer team to ilustrate
classifier user.
 
 


Requirements 
opencv4nodejs
(see: https://www.npmjs.com/package/opencv4nodejs)

MacOS / OSX
cmake brew install cmake
XQuartz for the dlib GUI (brew cask install xquartz)
libpng for reading images (brew install libpng)

Linux
cmake
libx11 for the dlib GUI (sudo apt-get install libx11-dev)
libpng for reading images (sudo apt-get install libpng-dev)
Windows

cmake
VS2017 build tools (not Visual Studio 2017) -> https://www.visualstudio.com/de/downloads/
(from https://www.npmjs.com/package/face-recognition)


run:
npm install

[advertising_recognition.js]

This module detect adidas ball (1976 model, white and black) from video / webcam image device

You can change classifier, at line 21.

[backend.js && personOfInteres3.js]

Desing Choices
backend.js and personOfInterest.js  are facial recognition software for static images as well as for videos,
performing the operations of face recognition and identification of the individual, 
using the techniques of dlib, from nodejs.
See: face-recognition.js (https://github.com/justadudewhohacks/face-recognition.js)
and http://dlib.net/ for more info about the CNN or classic Histogram of Oriented feature (HOG)                                        Gradients (HOG) feature

start server with:
node backend.js // node personOfInterest3.js

access: https://localhost:3000 for the static recognizer
index.html is a basic html than allows

1) take several images and put under same id and save to file system server
2) process this images and extract faces on them, and put at 'process' file system server
3) train and obtain the dlib model for recognizer.
4) take a webcam image and test the recognizer.

The model trained is valid for video recog too.

Thanks to Alex Gasco Perez for his contribution

(c) Nacho Ariza - 12/2018


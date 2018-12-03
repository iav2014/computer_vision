**nodejs computer vision example**

this example code using OpenCV to recognize some objects in video movie.
Thanks for Ball cascade model: 
(https://github.com/dbloisi/detectball/blob/master/ball_cascade.xml)


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

run:
npm install

[advertising_recognition.js]

This module detect adidas ball (1976 model, white and black) from video / webcam image device

You can change classifier, at line 21.

(c) Nacho Ariza - 12/2018

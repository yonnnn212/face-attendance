const video =
document.getElementById("video");

Promise.all([
faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
faceapi.nets.faceRecognitionNet.loadFromUri("./models")
]).then(startVideo);

function startVideo(){

navigator.mediaDevices
.getUserMedia({
video:true
})
.then(stream=>{
video.srcObject=stream;
});

}

video.addEventListener(
"play",
()=>{

setInterval(
scanFace,
1000
);

}
);

async function scanFace(){

const detection =
await faceapi
.detectSingleFace(video)
.withFaceLandmarks()
.withFaceDescriptor();

if(!detection){
return;
}

let bestMatch=null;

let bestDistance=1;

for(
let i=0;
i<localStorage.length;
i++
){

const key =
localStorage.key(i);

const student =
JSON.parse(
localStorage.getItem(key)
);

const savedDescriptor =
new Float32Array(
student.descriptor
);

const distance =
faceapi.euclideanDistance(
detection.descriptor,
savedDescriptor
);

if(distance<bestDistance){

bestDistance=
distance;

bestMatch=
student;

}

}

if(
bestMatch &&
bestDistance<0.5
){

const now=
new Date()
.toLocaleString();

document
.getElementById("result")
.innerHTML=

`
Nama : ${bestMatch.nama}
<br>
NIM : ${bestMatch.nim}
<br>
Waktu : ${now}
`;

}

}
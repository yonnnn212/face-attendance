const video =
document.getElementById("video");

const result =
document.getElementById("result");

let students = [];

async function loadStudents(){

    students =
    await fetch("students.json")
    .then(response =>
        response.json()
    );

    console.log(
        "Students loaded:",
        students
    );

}

async function loadModels(){

    await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");

    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

    await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

    await loadStudents();

    startVideo();

}

loadModels();

function startVideo(){

    navigator.mediaDevices
    .getUserMedia({
        video:true
    })
    .then(stream=>{

        video.srcObject =
        stream;

    })
    .catch(error=>{

        console.error(error);

        alert(
            "Kamera tidak dapat diakses"
        );

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

    console.log(
        "Video:",
        video.videoWidth,
        video.videoHeight
    );

    const detection =
    await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();

    console.log(
        "Detection:",
        detection
    );

}

    if(!detection){
        return;
    }

    let bestMatch = null;

    let bestDistance = 1;

    for(const student of students){

        const savedDescriptor =
        new Float32Array(
            student.descriptor
        );

        const distance =
        faceapi.euclideanDistance(
            detection.descriptor,
            savedDescriptor
        );

        if(distance < bestDistance){

            bestDistance =
            distance;

            bestMatch =
            student;

        }

    }

    if(
        bestMatch &&
        bestDistance < 0.5
    ){

        const now =
        new Date()
        .toLocaleString();

        result.innerHTML =

        `
        <h2>${bestMatch.nama}</h2>

        <p>
        NIM :
        ${bestMatch.nim}
        </p>

        <p>
        Waktu :
        ${now}
        </p>

        <p>
        Similarity :
        ${(1-bestDistance).toFixed(2)}
        </p>
        `;

    }

}

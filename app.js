const video = document.getElementById("video");
const result = document.getElementById("result");

let students = [];

function log(text){

    let debug =
    document.getElementById("debug");

    if(!debug){

        debug =
        document.createElement("div");

        debug.id = "debug";

        document.body.appendChild(debug);

    }

    debug.innerHTML += text + "<br>";
}

window.onerror = function(msg, url, line){

    log(
        "ERROR: " +
        msg +
        " line:" +
        line
    );

};

async function loadStudents(){

    log("Loading students...");

    const response =
    await fetch("students.json");

    students =
    await response.json();

    log(
        "Students loaded: " +
        students.length
    );

}

async function loadModels(){

    try{

        log("Loading SSD...");

        await faceapi.nets.ssdMobilenetv1.loadFromUri(
            "./models"
        );

        log("SSD OK");

        await faceapi.nets.faceLandmark68Net.loadFromUri(
            "./models"
        );

        log("LANDMARK OK");

        await faceapi.nets.faceRecognitionNet.loadFromUri(
            "./models"
        );

        log("RECOGNITION OK");

        await loadStudents();

        log("MODELS LOADED");

        startVideo();

    }
    catch(error){

        log(
            "MODEL ERROR: " +
            error
        );

    }

}

function startVideo(){

    log("Starting camera...");

    navigator.mediaDevices
    .getUserMedia({
        video:true
    })
    .then(stream=>{

        log("Camera allowed");

        video.srcObject =
        stream;

    })
    .catch(error=>{

        log(
            "CAMERA ERROR: " +
            error
        );

    });

}

video.addEventListener(
"play",
()=>{

    log("Video playing");

    setInterval(
        scanFace,
        1000
    );

}
);

async function scanFace(){

    try{

        log(
            "Video: " +
            video.videoWidth +
            " x " +
            video.videoHeight
        );

        const detection =
        await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

        log(
            "Detection: " +
            (detection ? "YES" : "NO")
        );

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

        log(
            "Distance: " +
            bestDistance
        );

        if(
            bestMatch &&
            bestDistance < 0.7
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
            Distance :
            ${bestDistance.toFixed(3)}
            </p>
            `;

        }

    }
    catch(error){

        log(
            "SCAN ERROR: " +
            error
        );

    }

}

loadModels();

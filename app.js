const video = document.getElementById("video");
const result = document.getElementById("result");

let students = [];

async function loadStudents() {

    const response = await fetch("students.json");
    students = await response.json();

    console.log("Students loaded:", students);
}

async function loadModels() {

    console.log("Loading models...");

    await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

    console.log("Models loaded");

    await loadStudents();

    startVideo();
}

function startVideo() {

    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => {

            video.srcObject = stream;

        })
        .catch(error => {

            console.error(error);

            alert("Kamera tidak dapat diakses");

        });
}

video.addEventListener("play", () => {

    setInterval(scanFace, 1000);

});

async function scanFace() {

    try {

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

        console.log("Detection:", detection);

        if (!detection) {
            return;
        }

        let bestMatch = null;
        let bestDistance = 1;

        for (const student of students) {

            const savedDescriptor =
                new Float32Array(
                    student.descriptor
                );

            const distance =
                faceapi.euclideanDistance(
                    detection.descriptor,
                    savedDescriptor
                );

            if (distance < bestDistance) {

                bestDistance = distance;
                bestMatch = student;

            }
        }

        console.log(
            "Distance:",
            bestDistance
        );

        if (
            bestMatch &&
            bestDistance < 0.7
        ) {

            const now =
                new Date().toLocaleString();

            result.innerHTML = `
                <h2>${bestMatch.nama}</h2>
                <p>NIM : ${bestMatch.nim}</p>
                <p>Waktu : ${now}</p>
                <p>Distance : ${bestDistance.toFixed(3)}</p>
            `;
        }

    } catch (error) {

        console.error(error);

    }
}

loadModels();

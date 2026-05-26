let selectedFile = null;

// ambil elemen html
const namaInput =
document.getElementById("nama");

const nimInput =
document.getElementById("nim");

const imageUpload =
document.getElementById("imageUpload");

const preview =
document.getElementById("preview");

const saveBtn =
document.getElementById("saveBtn");

// load model
async function loadModels() {

    try {

        await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");

        await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

        await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

        console.log("Model berhasil dimuat");

    } catch (error) {

        console.error(error);

        alert("Model gagal dimuat");

    }

}

loadModels();

// preview foto
imageUpload.addEventListener(
    "change",
    function(event){

        selectedFile =
        event.target.files[0];

        if(!selectedFile){
            return;
        }

        preview.src =
        URL.createObjectURL(
            selectedFile
        );

        preview.style.display =
        "block";

    }
);

// tombol simpan
saveBtn.addEventListener(
    "click",
    registerFace
);

// simpan descriptor wajah
async function registerFace(){

    const nama =
    namaInput.value.trim();

    const nim =
    nimInput.value.trim();

    if(nama === ""){

        alert("Masukkan nama");

        return;
    }

    if(nim === ""){

        alert("Masukkan NIM");

        return;
    }

    if(!selectedFile){

        alert(
            "Pilih foto terlebih dahulu"
        );

        return;
    }

    try {

        const image =
        await faceapi.bufferToImage(
            selectedFile
        );

        const detection =
        await faceapi
        .detectSingleFace(image)
        .withFaceLandmarks()
        .withFaceDescriptor();

        if(!detection){

            alert(
                "Wajah tidak ditemukan pada foto"
            );

            return;
        }

        const studentData = {

            nama: nama,

            nim: nim,

            descriptor: Array.from(
                detection.descriptor
            )

        };

        localStorage.setItem(
            nim,
            JSON.stringify(
                studentData
            )
        );

        alert(
            "Data mahasiswa berhasil disimpan"
        );

        namaInput.value = "";
        nimInput.value = "";
        imageUpload.value = "";
        preview.src = "";
        preview.style.display = "none";

        selectedFile = null;

    } catch(error){

        console.error(error);

        alert(
            "Terjadi kesalahan. Lihat Console (F12)"
        );

    }

}
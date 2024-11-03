const socket = io.connect('http://127.0.0.1:5000');
const remoteVideo = document.getElementById('webcam');
let intro = false;
let mediaRecorder;
let chunks = [];

const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');
const manual = ["Aa", "Bb", "Cc"]
let ct = 0

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let peerConnection;
startButton.onclick = startRecording;
stopButton.onclick = stopRecording;


initCamera();

async function initCamera(){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true ,audio: true });
    } catch (error){
        alert("Could not connect camera...")
    }

    mediaRecorder = new MediaRecorder(localStream);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            // Send the video data to the server
            //socket.emit('video_stream', event.data); - also not needed
            chunks.push(event.data);
            console.log('adding to chunks!');
        }
    };
    remoteVideo.srcObject = localStream;

    mediaRecorder.onstop = function() {
        const blob = new Blob(chunks, {type: 'video/webm'}); //not sure if this is spaghetti    
        const formData = new FormData();
        formData.append('video', blob, 'recorded_video.webm');
        console.log("about to upload video!");
        fetch('/upload-video', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(result => {
            console.log("SUCESS: ", result);
        }).catch(error => {
            console.error("ERROR! while receiving response from /upload-video\n", error);
        });
        chunks = [];
        console.log("chunks reset!");
    };
}

// Get user media and start the WebRTC connection
async function startRecording() {
    console.log("works");
    mediaRecorder.start(100); // Send data every 100ms
    //socket.emit('start_stream'); // Notify server to start saving x-> this is actually just not needed
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
}

async function stopRecording(){
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    // Stop the MediaRecorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (!window.location.href.includes("generation"))
        debug();

        //socket.emit('stop_stream'); // Notify server to stop saving -> this is actually just not needed

    if (window.location.href.includes("generation")) {
        const con = document.getElementsByClassName("right-con")[0];
        const div = document.createElement("div");
        div.className = "loader";
        con.replaceChild(div, remoteVideo);
        setTimeout(() => {
            con.replaceChild(remoteVideo, div);
        }, 1500);
    }
    //socket.emit('stop_stream'); // Notify server to stop saving -> this is actually just not needed
};

/*read json object:
{
    "body": {
        "text": "dummy text of asl",
        "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAgMBAPXnD3YAAAAASUVORK5CYII="
        
    }
}
*/
async function read_response_json(jason){
    const body = jason.body;
    const text = body.text;
    const base64String = body.image;

    const img = new Image();
    img.src = "data:image/png;base64," + base64String;

    return [img, text];

    //you guys figure out what to do with this image object 
    //make text object and figureo ut where to put
}

function onIntroFinish() {
    const body = document.getElementsByClassName("main-content")[0];
    const buttonCon = document.getElementsByClassName("button-con")[0];
    if (window.location.href.includes("phrase")) {
        const introClick = document.getElementById("finish");
        introClick.removeAttribute("hidden");
        introClick.addEventListener("click", () => {
            window.location.href = "/generation";
        });
    }
    body.style.marginTop = "5%";

    buttonCon.removeAttribute("hidden");
    startButton.removeAttribute("hidden");
    stopButton.removeAttribute("hidden");
}

async function run() {
    await initCamera();
    onIntroFinish();
}

run();

async function debug() {
    ct += 1;
    setTimeout(() =>{
        document.getElementById("stopBtn").style.backgroundColor = "green";
        document.getElementById("stopBtn").innerText = "Correct!";
    }, "500")

    setTimeout(() => {
        if(ct == 3 && !window.location.href.includes("phrase")){
            window.location.href += "phrase";
            return;
        }
        if (!window.location.href.includes("phrase"))
            document.getElementById("process_ltr").innerText = manual[ct]

        document.getElementById("stopBtn").style.backgroundColor = "red";
        document.getElementById("stopBtn").innerText = "Stop";
    }, "2000");
}

const socket = io.connect('http://127.0.0.1:5000');
const remoteVideo = document.getElementById('webcam');
let mediaRecorder;
const chunks = [];

const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let peerConnection;

async function stopCamera(){
    startButton.disabled = false;
    stopButton.disabled = true;
    // Stop the MediaRecorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    // Stop the video stream tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    // Remove the video stream from the video element
    remoteVideo.srcObject = null;
    
    // Notify the server to stop saving the stream
    socket.emit('stop_stream');
};


// Get user media and start the WebRTC connection
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error){
        alert("Could not connect camera...")
    }
    remoteVideo.srcObject = localStream;
    let chunks = [];

    mediaRecorder = new MediaRecorder(localStream);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            // Send the video data to the server
            socket.emit('video_stream', event.data);
            chunks.push(event.data);
        }
    };
    mediaRecorder.onstop = function(){
        const blob = new Blob(chunks, {type: 'video/webm'}); //not sure if this is spaghetti
        chunks = [];
    
        const formData = new FormData();
        formData.append('video', blob, 'recorded_video.webm');
    
        fetch('/upload-video', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(result => {
            console.log("SUCESS: ", result);
        }).catch(error => {
            console.error("ERROR! while receiving response from /upload-video\n", error);
        });
    };

    mediaRecorder.start(100); // Send data every 100ms
    socket.emit('start_stream'); // Notify server to start saving
    startButton.disabled = true;
    stopButton.disabled = false;
}

startButton.onclick = startCamera;
stopButton.onclick = stopCamera;

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
    introClick.removeAttribute("hidden");
    body.style.marginTop = "-10%";
}
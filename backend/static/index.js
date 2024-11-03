const socket = io.connect('http://127.0.0.1:5000');
const remoteVideo = document.getElementById('remoteVideo');
let mediaRecorder;
const chunks = [];

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let peerConnection;

const base64String = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12NgYGBgAAAABQABDQottgAAAABJRU5ErkJggg==';

const img = new Image();
img.src = 'data:image/png;base64,' + base64String;

// Append the image to a container element
document.getElementById('image-container').appendChild(img);

async function stopCamera(){
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
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
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
}

document.getElementById("startBtn").onclick = startCamera;
document.getElementById('stopBtn').onclick = stopCamera;

function get_image_base64(){
    const prompt = document.getElementById('promptInput').value;
    fetch('/generate-image-base64',{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({prompt: prompt})
    })
    .then(response => response.json())
    .then(data => {
        console.log('outputting >_<')
        if(data.image_data){
            const base64String = data.image_data;

            const img = new Image();
            img.src = "data:image/png;base64," + base64String;

            container.innerHTML = '';
            document.getElementById('image-container').appendChild(img);
        }else{
            console.error("data.image_data DOES NOT EXIST.", data.message);
        }
    })
    .catch(error => {
        console.error("error fetching the base64 image: ", error);
    })
    /*
    .finally(() => {
        // Schedule the next fetch after a delay
        setTimeout(get_base64_image, 5000); // Adjust the delay as needed
    });
    */
}

document.getElementById("generateBtn").onclick = get_image_base64;
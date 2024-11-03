const socket = io.connect('http://localhost:5000');
const remoteVideo = document.getElementById('remoteVideo');
let mediaRecorder;
const chunks = [];

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let peerConnection;

// Get user media and start the WebRTC connection
async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error){
        console.error("Error accessing the webcam:", error);
        alert("Could not connect camera...")
    }
    remoteVideo.srcObject = localStream;

    mediaRecorder = new MediaRecorder(localStream);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            // Send the video data to the server
            socket.emit('video_stream', event.data);
        }
    };

    mediaRecorder.start(100); // Send data every 100ms
    socket.emit('start_stream'); // Notify server to start saving
}

document.getElementById("startBtn").onclick = startCamera;
document.getElementById('stopBtn').onclick = stopCamera;

//stop here

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
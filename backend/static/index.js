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
startCamera()
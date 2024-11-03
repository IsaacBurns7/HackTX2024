const video = document.getElementById("webcam");
const introClick = document.getElementById("finish");
const intro = false;

async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    document.getElementById("progress").removeAttribute("hidden");
  } catch (error) {
    console.error("Error accessing the webcam:", error);
    alert("Unable to access the webcam. Please check your permissions.");
  }
}

// call when intro becomes true
function onIntroFinish() {
  const body = document.getElementsByClassName("main-content")[0];
  introClick.removeAttribute("hidden");
  body.style.marginTop = "5%";
}

startWebcam();
setTimeout(() => {
  onIntroFinish();
} , 1000); // temporary, change later
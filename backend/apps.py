from flask import Flask, render_template, Response, request
from flask_socketio import SocketIO, emit

from flask_cors import CORS
import cv2
from dotenv import load_dotenv
import numpy as np
import C1
import json


load_dotenv(".env")
app = Flask(__name__)
CORS(app)
socket_io = SocketIO(app)

def generate_frames():
    camera = cv2.VideoCapture(0)

    while True:
        success, frame = camera.read()
        if not success:
            print('failed to get webcam')
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
@app.route('/video-feed')
def video_feed():
    return Response(generate_frames(), 
            mimetype = "multipart/x-mixed-replace; boundary=frame")

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/give-text", methods = ["POST"])
def receive_text():


@app.route("/get-video", methods = ["GET"])
def give_video():

@socketio.on('offer')
def handle_offer(offer):
    emit('offer', offer, broadcast=True, include_self = False)
@socketio.on('answer')
def handle_answer(answer):
    emit('answer', answer, broadcast=True, include_self=False)
@socketio.on('candidate')
def handle_candidate(candidate):
    emit('candidate', candidate, broadcast=True, include_self=False)

@socketio.on('video_stream')
def handle_video_stream(data):
    #decode image
    np_array = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    #save frame as video
    if frame is not None:
        out.write(frame)

@socketio.on('start_stream')
def start_stream():
    global out
    #create videowriter object to save video
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter("output.avi", fourcc, 20.0, (640, 480))

@socketio.on('stop_stream')
def stop_stream():
    out.release()
    emit('stream_stopped')

if __name__ == '__main__':
    app.run(debug=True)
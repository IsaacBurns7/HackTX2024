#responsibilities
#interpret base64 images from oscar into real images, send to frontend

from flask import Flask, render_template, Response, request, jsonify
from flask_socketio import SocketIO, emit

from flask_cors import CORS
import cv2
from dotenv import load_dotenv
import numpy as np
import json
import os
import base64
#import C1

#default behavior
stored_base64_string = 


load_dotenv(".env")
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

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
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), 
            mimetype = "multipart/x-mixed-replace; boundary=frame")

@app.route('/')
def index():
    return render_template('index.html')

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

@app.route("/upload-video", methods = ["POST"])
def handle_upload_video():
    if 'video' not in request.files:
        return jsonify({'message': 'NO VIDEO UPLOADED!!! :('})

    video = request.files['video']

    upload_folder = 'uploads'

    video_path = os.path.join(upload_folder, video.filename)
    video.save(video_path)
    
    return jsonify({'message': 'message uploaded successfully!'})


#@app.route("/get-video", methods = ["GET"])
#def give_video():
#    return jsonify(video)

@app.route("/upload-image-base64", methods = ["POST"])
def handle_upload_image_base64():
    data = request.get_json()
    base64_string = data.get('image_data', '')
    if base64_string:
        # You can process or store the base64 string as needed
        # For example, save it to a variable or database
        # Here, we'll store it in a global variable (not recommended for production)
        global stored_base64_string
        stored_base64_string = base64_string
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'No base64 string received'}), 400
    
@app.route("/get-image-base64", methods = )
def handle_get_image_base64():
    global stored_base64_string
    if stored_base64_string:
        return jsonify({'image_data': stored_base64_string}), 200
    else:
        return jsonify({'status': 'error', 'message': 'No image data available'}), 404


if __name__ == '__main__':
    app.run(debug=True)

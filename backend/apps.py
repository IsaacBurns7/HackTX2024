from flask import Flask, render_template, Response, request
from flask_socketio import SocketIO, emit

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socket_io

@app.route("/give-text", methods = ["POST"])
def receive_text():


@app.route("/get-video", methods = ["GET"])
def give_video():


if __name__ == '__main__':
    app.run(debug=True)
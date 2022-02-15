from flask import request
from flask_socketio import Namespace, emit,send

class FeedsNamespace(Namespace):
    def on_connect(self):
        print("Client connected : sid => ",request.sid)
        emit("my response", {"data": "Connected"})

    def on_disconnect(self):
        print("Client disconnected : sid => ",request.sid)

    def on_message(self, msg):
        print("sessid: ",request.sid)
        print("Message: " + msg)
        send(msg, broadcast=True)
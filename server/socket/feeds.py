from flask import request
from flask_socketio import Namespace, emit,send
from ..models import Feeds
from .. import db

import json

class FeedsNamespace(Namespace):
    def on_connect(self):
        print("Client connected : sid => ",request.sid)
        emit("my response", {"data": "Connected"})

    def on_disconnect(self):
        print("Client disconnected : sid => ",request.sid)

    def on_message(self, msg):
        send(msg, broadcast=True)
    
    def on_newFeed(self,msg):
        print("on_newFeed",msg)
        
        new_feed =  Feeds(content=msg['content'],img1=json.dumps(msg['imagePath']),user_id=1)
        db.session.add(new_feed)
        commit = db.session.commit()
        print("commit : ",commit)
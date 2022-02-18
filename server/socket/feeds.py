from flask import request, session
from flask_socketio import Namespace, emit, send
from ..models import Feeds, Follow, Users
from .. import db
import json


class FeedsNamespace(Namespace):
    def on_connect(self):
        follwing = Follow.query.filter_by(user_id=session["uId"]).all()
        friend_recommend = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [j for j in Users.query.filter(Users.id.notin_(follwing)).limit(5).all()]
        ]
        emit("friend_recommend", friend_recommend, broadcast=False)
        print("Client connected : sid => ", request.sid)

    def on_disconnect(self):
        print("Client disconnected : sid => ", request.sid)

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_newFeed(self, msg):
        try:
            new_feed = Feeds(
                content=msg["content"],
                img1=json.dumps(msg["imagePath"]),
                user_id=session["uid"],
            )
            db.session.add(new_feed)
            db.session.commit()
        except:
            emit("newFeedError", broadcast=False)
        else:
            emit("newFeedSuccess", broadcast=False)

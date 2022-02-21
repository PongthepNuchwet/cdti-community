from flask import request, session
from flask_socketio import Namespace, emit, send
from ..models import Feeds, Follow, Users
from .. import db
import json
import time


class FeedsNamespace(Namespace):
    def emitingProfile(self):
        data = [
            {"profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [
                j for j in Users.query.filter_by(id=session["uId"]).limit(5).all()
            ]
        ]
        emit("profile", data, broadcast=False)

    def emitingNew(self):
        pass

    def emitingFriendRequired(self):
        requried = [
            i.user_id
            for i in Follow.query.filter_by(following=session["uId"], status=0)
            .limit(5)
            .all()
        ]
        friend_requried = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [j for j in Users.query.filter(Users.id.in_(requried)).all()]
        ]
        emit("friend_Required", friend_requried, broadcast=False)

    def emitingFriendRecommend(self):
        follwing = [
            i.following for i in Follow.query.filter_by(user_id=session["uId"]).all()
        ]
        follwing.append(session["uId"])
        friend_recommend = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [
                j for j in Users.query.filter(Users.id.notin_(follwing)).limit(5).all()
            ]
        ]
        emit("friend_recommend", friend_recommend, broadcast=False)

    def getSecketIdByUid(self, id):
        user = Users.query.filter_by(id=id).first()
        return user.socket_id

    def removeSecketId(self):
        user = Users.query.filter_by(id=session["uId"]).first()
        user.socket_id = None
        db.session.commit()

    def updateSecketId(self, id):
        user = Users.query.filter_by(id=session["uId"]).first()
        user.socket_id = id
        db.session.commit()

    def concacts(self):
        follwing = [
            i.following for i in Follow.query.filter_by(user_id=session["uId"],status=1).all()
        ]
        concacts = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [j for j in Users.query.filter(Users.id.in_(follwing)).all()]
        ]
        emit("concacts", concacts, broadcast=False)


    def on_connect(self):
        start = time.time()
        self.emitingProfile()
        self.updateSecketId(request.sid)
        self.emitingFriendRecommend()
        self.emitingFriendRequired()
        self.concacts()
        end = time.time()
        print("end - start",end - start)

    def on_disconnect(self):
        self.removeSecketId()
        pass

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_newFeed(self, msg):
        try:
            new_feed = Feeds(
                content=msg["content"],
                img1=json.dumps(msg["imagePath"]),
                user_id=session["uId"],
            )
            db.session.add(new_feed)
            db.session.commit()
        except:
            emit("newFeedError", broadcast=False)
        else:
            emit("newFeedSuccess", broadcast=False)

    def on_follow(self, msg):
        print("on_follow", msg)
        try:
            new_Follow = Follow(
                following=msg["follow_id"], user_id=session["uId"], status=0
            )
            db.session.add(new_Follow)
            db.session.commit()
        except:
            emit("newFollowError", broadcast=False)
        else:
            emit(
                "follower",
                "{} sent a request to follow you.".format(msg["name"]),
                to=self.getSecketIdByUid(msg["follow_id"]),
            )
            emit("newFollowSuccess", broadcast=False)

    def on_accept(self, msg):
        print("on_accept", msg)
        try:
            new_accept = Follow.query.filter_by(
                following=session["uId"], user_id=msg["follow_id"], status=0
            ).first()
            new_accept.status = 1
            db.session.commit()
        except:
            emit("newAcceptError", broadcast=False)
        else:
            emit(
                "Accept",
                "{} has accepted you to follow.".format(msg["name"]),
                to=self.getSecketIdByUid(msg["follow_id"]),
            )
            emit("newAcceptSuccess", broadcast=False)

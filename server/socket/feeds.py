from flask import request, session
from flask_socketio import Namespace, emit, send
import json
import time


class FeedsNamespace(Namespace):
    def __init__(self, namespace, db, Feeds, Follow, Users):
        super().__init__(namespace)
        self.db = db
        self.Feeds = Feeds
        self.Follow = Follow
        self.Users = Users

    def emiting_profile(self):
        data = [
            {"profile": i.profile, "fullName": i.fullName, "email": i.email} for i in
            list(self.Users.query.filter_by(id=session['uId']).limit(5).all())
        ]
        emit("profile", data, broadcast=False)

    def emiting_friend_required(self):
        requried = [
            i.user_id
            for i in self.Follow.query.filter_by(following=session["uId"], status=0)
            .all()
        ]
        print("requried", requried)
        friend_requried = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email}
            for i in list(self.Users.query.filter(self.Users.id.in_(requried)).all())
        ]
        print("friend_requried", friend_requried)
        emit("friend_Required", friend_requried, broadcast=False)

    def emiting_friend_recommend(self):
        follwing = [
            i.following for i in self.Follow.query.filter_by(user_id=session["uId"]).all()
        ]
        follwing.append(session["uId"])
        friend_recommend = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email}
            for i in list(self.Users.query.filter(self.Users.id.notin_(follwing)).limit(5).all())
        ]
        emit("friend_recommend", friend_recommend, broadcast=False)

    def get_secket_id_by_uid(self, uid):
        user = self.Users.query.filter_by(id=uid).first()
        print("get_secket_id_by_uid", user.socket_id)
        return user.socket_id

    def remove_secket_id(self):
        user = self.Users.query.filter_by(id=session["uId"]).first()
        user.socket_id = None
        self.db.session.commit()

    def update_secket_id(self, uid):
        user = self.Users.query.filter_by(id=session["uId"]).first()
        user.socket_id = uid
        self.db.session.commit()

    def concacts(self):
        follwing = [
            i.following for i in self.Follow.query.filter_by(user_id=session["uId"], status=1).all()
        ]
        print("follwing", follwing)
        concacts = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email}
            for i in list(self.Users.query.filter(self.Users.id.in_(follwing)).all())
        ]
        emit("concacts", concacts, broadcast=False)

    def on_connect(self):
        start = time.time()
        self.emiting_profile()
        self.update_secket_id(request.sid)
        self.emiting_friend_recommend()
        self.emiting_friend_required()
        self.concacts()
        end = time.time()
        print("end - start", end - start)

    def on_disconnect(self):
        self.remove_secket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_newFeed(self, msg):
        try:
            new_feed = self.Follow(
                content=msg["content"],
                img1=json.dumps(msg["imagePath"]),
                user_id=session["uId"],
            )
            self.db.session.add(new_feed)
            self.session.commit()
        except IndexError:
            emit("newFeedError", broadcast=False)
        else:
            emit("newFeedSuccess", broadcast=False)

    def emit_to(self, event, data, uid):
        to = self.get_secket_id_by_uid(uid)
        if to is not None:
            emit(event, data, to=to)

    def on_follow(self, msg):
        print("on_follow", msg)
        try:
            new_Follow = self.Follow(
                following=msg["follow_id"], user_id=session["uId"], status=0
            )
            self.db.session.add(new_Follow)
            self.db.session.commit()
        except IndexError:
            emit("newFollowError", broadcast=False)
        else:
            emit("newFollowSuccess", broadcast=False)
            user = [
                {"id": i.id, "profile": i.profile,
                 "fullName": i.fullName, "email": i.email}
                for i in [self.Users.query.filter_by(id=session["uId"]).first()]
            ]
            self.emit_to(
                "follower", f"{msg['name']} sent a request to follow you.", msg["follow_id"])
            self.emit_to("friend_Required_interrupt",
                         user[0], msg["follow_id"])

    def on_accept(self, msg):
        print("on_accept", msg)
        try:
            new_accept = self.Follow.query.filter_by(
                following=session["uId"], user_id=msg["follow_id"], status=0
            ).first()
            new_accept.status = 1
            self.db.session.commit()
        except IndexError as e:
            print(e)
            emit("newAcceptError", broadcast=False)
        else:

            emit("newAcceptSuccess", broadcast=False)
            user = [
                {"id": i.id, "profile": i.profile,
                 "fullName": i.fullName, "email": i.email}
                for i in [self.Users.query.filter_by(id=session["uId"]).first()]
            ]
            self.emit_to(
                "Accept", f"{msg['name']} has accepted you to follow.", msg["follow_id"])
            self.emit_to("concacts_interrupt", user[0], msg["follow_id"])

from distutils.log import error
from urllib import response
from xml.etree.ElementTree import Comment
from click import command
from flask import request, session
from flask_socketio import Namespace, emit, send
import time
from bson import json_util
import json


class FollowerNamespace(Namespace):
    def __init__(self, namespace, db, Feed, Follow, Like, Comment, User, Report, storage, token):
        super().__init__(namespace)
        self.db = db
        self.Feed = Feed
        self.Follow = Follow
        self.Like = Like
        self.User = User
        self.Comment = Comment
        self.Report = Report
        self.storage = storage
        self.token = token

    def emit_to(self, event, data, uid):
        sid ,namespace = self.get_socket_id_by_uid(uid)
        if sid is not None:
            emit(event, data, to=sid , namespace=namespace)

    def emiting_profile(self, uid=None):
        if uid is None:
            user = self.User.get_user_by_uid(session['uId'])
        else:
            user = self.User.get_user_by_uid(uid)
        if user:
            emit("profile", {"user": user,
                 "uid": session['uId']}, broadcast=False)
        else:
            emit("profile_notFound", broadcast=False)

    def get_socket_id_by_uid(self, uid):
        user = self.User.get_user_by_uid(uid)
        print(user)
        return user['socket_id'], user['namespace']

    def remove_socket_id(self):
        try:
            self.User.remove_socket_id_by_uid(uid=session["uId"])
        except IndexError:
            print(IndexError)

    def update_socket_id(self, namespace, sid):
        print("update_socket_id")
        try:
            self.User.update_socket_id_by_uid(
                sid=sid, uid=session["uId"], namespace='/'+namespace)
        except IndexError:
            print(IndexError)

    def default_json(self, data):
        return json.loads(json.dumps(data, default=json_util.default))

    def emiting_follower(self, uid):
        followers = self.Follow.get_follower_by_uid_all(uid)
        users = []
        for follower in followers:
            users.append(self.User.get_user_by_uid(follower))
        emit("follower", self.default_json(users), broadcast=False)

    def on_connect(self):
        print("page", request.args.get('page'))
        uid = request.args.get('uid')
        print("follower uid", uid)
        if request.args.get('page') == 'follower':
            self.update_socket_id(
                namespace=request.args.get('page'), sid=request.sid)
            uid = request.args.get('uid')
            print("profile", request.args.get('uid'))
            self.emiting_profile(uid=uid)
            self.emiting_follower(uid)

    def on_disconnect(self):
        self.remove_socket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_unFollower(self, msg):
        try:
            print(msg['id'], session['uId'])
            self.Follow.update_status_by_following_uid(
                msg['id'], session['uId'], 0)
        except IndexError:
            print(IndexError)
            emit("unFollower_error", broadcast=False)
        else:
            emit("unFollower_success", {
                 "follower_id": msg['id']}, broadcast=False)

    def on_accept(self, msg):
        print("on_accept", msg)
        try:
            self.Follow.update_status_by_following_uid_status(
                session["uId"], msg["follow_id"], 0)
        except IndexError as e:
            print(e)
            emit("accept_error", broadcast=False)
        else:
            emit("accept_success",{"follower_id": msg["follow_id"]} ,broadcast=False)
            user = self.User.get_user_by_uid(session['uId'])
            self.emit_to(
                "Accept", f"{user['fullName']} has accepted you to follow.", msg["follow_id"])
            self.emit_to("concacts_interrupt", user, msg["follow_id"])

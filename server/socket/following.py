from distutils.log import error
from urllib import response
from xml.etree.ElementTree import Comment
from click import command
from flask import request, session
from flask_socketio import Namespace, emit, send
import time
from bson import json_util
import json


class FollowingNamespace(Namespace):
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
        sid, namespace = self.get_socket_id_by_uid(uid)
        if sid is not None:
            emit(event, data, to=sid, namespace=namespace)

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

    def emiting_following(self, uid):
        print("emiting_following", uid)
        follwings = self.Follow.get_following_by_uid_and_status_all(
            uid=uid, state=1)
        users = []
        for follwing in follwings:
            users.append(self.User.get_user_by_uid(follwing))
        emit("following", self.default_json(users), broadcast=False)

    def on_connect(self):
        print("page", request.args.get('page'))
        uid = request.args.get('uid')
        print("follower uid", uid)
        if request.args.get('page') == 'following':
            self.update_socket_id(
                namespace=request.args.get('page'), sid=request.sid)
            uid = request.args.get('uid')
            print("profile", request.args.get('uid'))
            self.emiting_profile(uid=uid)
            self.emiting_following(uid)

    def on_disconnect(self):
        self.remove_socket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_unFollowing(self, msg):
        print("unfollowing")
        try:
            self.Follow.delete_by_following_uid(
                msg['following_id'], session['uId'])
        except IndexError:
            print(IndexError)
            emit("unFollowing_error", broadcast=False)
        else:
            emit("unFollowing_success", {
                 "following_id": msg['following_id']}, broadcast=False)

    def on_follow(self, msg):
        print("on_follow", msg)
        try:
            self.Follow.new(
                following=msg["follow_id"], uid=session["uId"], status=0)
        except IndexError:
            print("IndexError")
            emit("follow_error", broadcast=False)
        else:
            emit("follow_success", {
                 "following_id": msg['follow_id']}, broadcast=False)
            user = self.User.get_user_by_uid(session['uId'])
            self.emit_to(
                "follower", f"{user['fullName']} sent a request to follow you.", msg["follow_id"])
            self.emit_to("friend_Required_interrupt",
                         user, msg["follow_id"])

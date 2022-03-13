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

    def emiting_profile(self, uid=None):
        if uid is None:
            user = self.User.get_user_by_uid(session['uId'])
        else:
            user = self.User.get_user_by_uid(uid)
        if user:
            emit("profile", user, broadcast=False)
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

    def concacts(self, follwing):
        concacts = self.User.get_users_by_in_uid(follwing)
        emit("concacts", concacts, broadcast=False)

    def default_json(self, data):
        return json.loads(json.dumps(data, default=json_util.default))

    def on_connect(self):
        print("page", request.args.get('page'))
        if request.args.get('page') == 'follower':
            self.update_socket_id(
                namespace=request.args.get('page'), sid=request.sid)
            uid = request.args.get('uid')
            print("profile", request.args.get('uid'))
            self.emiting_profile(uid=uid)
            # self.emiting_feeds(page='profile', uid=uid)
            # print("end - start", end - start)

    def on_disconnect(self):
        self.remove_socket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

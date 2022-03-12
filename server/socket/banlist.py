from distutils.log import error
from urllib import response
from xml.etree.ElementTree import Comment
from click import command
from flask import request, session
from flask_socketio import Namespace, emit, send
import time
from bson import json_util
import json


class ReportNamespace(Namespace):
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

    def default_json(self, data):
        return json.loads(json.dumps(data, default=json_util.default))

    def emit_user_ban(self):
        users = self.User.get_user_by_status(2)
        emit("banlist", self.default_json(users), broadcast=False)

    def on_connect(self):
        print(request.sid)

    def on_disconnect(self):
        self.remove_secket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)
    
    def on_unBan(self, msg):
        print("on_unBan",msg)
        try:
            self.Report.set_status_content(msg['id'], msg['content'])
            self.User.set_status_user(msg['user_id'],'0')
        except:
            emit("unBan_error", broadcast=False)
        else:
            emit("unBan_success", {"id":msg['id']} ,broadcast=False)

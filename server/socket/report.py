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

    def get_detail_feed(self, Feeds):
        response = []
        for data in Feeds:
            feed = data
            feed['like_count'] = self.Like.get_count_by_feedId(data['id'])
            feed['comment_count'] = self.Comment.get_count_by_feedId(
                data['id'])
            feed['user'] = self.User.get_user_by_uid(data['user_id'])
            response.append(feed)
        return response

    def emit_report(self):
        reports = self.Report.get_report()
        res = []
        for report in reports:
            report['user'] = self.User.get_user_by_uid(report['user_id'])
            feed = self.Feed.get_feeds_by_id(report['feed_id'])
            report['feed'] = self.get_detail_feed(feed)
            res.append(report)
        emit("report", self.default_json(res), broadcast=False)

    def on_connect(self):
        print(request.sid)
        if self.Report.get_count() > 0:
            self.emit_report()
        else:
            emit("reportNotFound", broadcast=False)

    def on_disconnect(self):
        self.remove_secket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_open(self, msg):
        self.Report.set_status_admin(msg['id'], 1)

    def get_socket_id_by_uid(self, uid):
        user = self.User.get_user_by_uid(uid)
        print(user)
        return user['socket_id']

    def on_ban(self, msg):
        try:
            self.Report.set_status_content(msg['id'], msg['content'])
            sid = self.get_socket_id_by_uid(msg['user_id'])
            emit('ban', to=sid ,namespace='/feeds')
            emit('ban', to=sid ,namespace='/profile')
            emit('ban', to=sid ,namespace='/friens')
            self.User.set_status_user(msg['user_id'],'2')

        except:
            emit("ban_error", broadcast=False)
        else:
            emit("ban_success",{"id":msg['id']}, broadcast=False)
    
    def on_unBan(self, msg):
        print("on_unBan",msg)
        try:
            self.Report.set_status_content(msg['id'], msg['content'])
            self.User.set_status_user(msg['user_id'],'0')
        except IndexError as e:
            print(e)
            emit("unBan_error", broadcast=False)
        else:
            emit("unBan_success", {"id":msg['id']} ,broadcast=False)



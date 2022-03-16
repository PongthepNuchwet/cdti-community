from distutils.log import error
from urllib import response
from xml.etree.ElementTree import Comment
from click import command
from flask import request, session
from flask_socketio import Namespace, emit, send
import time
from bson import json_util
import json


class FeedsNamespace(Namespace):
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

    def emiting_friend_required(self):
        requried = self.Follow.get_uids_by_following_and_status(
            session['uId'], 0)
        friend_requried = self.User.get_users_by_in_uid(requried)
        emit("friend_Required", friend_requried, broadcast=False)

    def emiting_friend_recommend(self):
        follwing = self.Follow.get_following_by_uid_all(session["uId"])
        follwing.append(session["uId"])
        friend_recommend = self.User.get_users_by_notin_uids_and_limit(
            follwing, 5)
        emit("friend_recommend", friend_recommend, broadcast=False)

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

    def get_like(self, feed_id):
        res = []
        likes = self.Like.get_like_by_feedId_all(feed_id)
        for data in likes:
            like = data
            like['user'] = self.User.get_user_by_uid(data['user_id'])
            res.append(like)
        return res

    def get_comment(self, feed_id, count, notIn):
        res = []
        comments = self.Comment.get_comment_by_feedId_limit_notin(
            feed_id, count, notIn)
        for data in comments:
            comment = data
            comment['user'] = self.User.get_user_by_uid(data['user_id'])
            res.append(comment)

        return res

    def default_json(self, data):
        return json.loads(json.dumps(data, default=json_util.default))

    def get_detail_feed(self, Feeds):
        response = []
        for data in Feeds:
            feed = data
            feed['like'] = self.get_like(data['id'])
            feed['like_count'] = self.Like.get_count_by_feedId(data['id'])
            feed['comment'] = self.get_comment(data['id'], 3, [])
            feed['comment_count'] = self.Comment.get_count_by_feedId(
                data['id'])
            feed['user'] = self.User.get_user_by_uid(data['user_id'])
            response.append(feed)
        return response

    def get_feeds(self, page='feeds', follwing=None, uid=None):
        print("get_feeds", page, follwing)
        if page == 'feeds':
            addMe = list(follwing)
            addMe.append(session['uId'])
            Feeds = self.Feed.get_feeds_by_in_uid(addMe)
            response = self.get_detail_feed(Feeds=Feeds)
            return response
        elif page == 'profile':
            print("get_feeds uid", uid)
            Feeds = self.Feed.get_feeds_by_in_uid([uid])
            response = self.get_detail_feed(Feeds=Feeds)
            return response

    def emiting_feeds(self, page='feeds', follwing=None, uid=None):
        if page == 'feeds':
            res = self.get_feeds(page='feeds', follwing=follwing)
            emit("feeds", self.default_json(res), broadcast=False)
        elif page == 'profile':
            res = self.get_feeds(page='profile', uid=uid)
            emit("feeds", self.default_json(res), broadcast=False)

    def on_connect(self):
        print("page", request.args.get('page'))
        if request.args.get('page') == 'feeds':
            # start = time.time()
            follwing = self.Follow.get_following_by_uid_and_status_all(
                uid=session["uId"], state=1)
            self.emiting_feeds(page='feeds', follwing=follwing)
            self.emiting_profile()
            self.update_socket_id(
                namespace=request.args.get('page'), sid=request.sid)
            self.emiting_friend_recommend()
            self.emiting_friend_required()
            self.concacts(follwing)
            end = time.time()
        elif request.args.get('page') == 'profile':
            self.update_socket_id(
                namespace=request.args.get('page'), sid=request.sid)
            uid = request.args.get('uid')
            print("profile", request.args.get('uid'))
            self.emiting_profile(uid=uid)
            self.emiting_feeds(page='profile', uid=uid)
            # print("end - start", end - start)

    def on_disconnect(self):
        self.remove_socket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_newFeed(self, msg):
        new_feed = ''
        try:
            print("msgimagePath", msg["imagePath"])
            new_feed = self.Feed.new(
                content=msg["content"], img1=msg["imagePath"], uid=session["uId"])
        except IndexError:
            print(IndexError)
            emit("newFeedError", broadcast=False)
        else:
            feed = self.Feed.get_feeds_by_id(new_feed)
            feed_detail = self.get_detail_feed(feed)
            res = self.default_json(data=feed_detail)
            emit("newFeedSuccess", res, broadcast=False)

    def emit_to(self, event, data, uid):
        sid, namespace = self.get_socket_id_by_uid(uid)
        if sid is not None:
            emit(event, data, to=sid, namespace=namespace)

    def on_follow(self, msg):
        print("on_follow", msg)
        try:
            self.Follow.new(
                following=msg["follow_id"], uid=session["uId"], status=0)
        except IndexError:
            emit("newFollowError", broadcast=False)
        else:
            emit("newFollowSuccess", broadcast=False)
            user = self.User.get_user_by_uid(session['uId'])
            self.emit_to(
                "follower", f"{msg['name']} sent a request to follow you.", msg["follow_id"])
            self.emit_to("friend_Required_interrupt",
                         user, msg["follow_id"])

    def on_accept(self, msg):
        print("on_accept", msg)
        try:
            self.Follow.update_status_by_following_uid_status(
                session["uId"], msg["follow_id"], 0)
        except IndexError as e:
            print(e)
            emit("newAcceptError", broadcast=False)
        else:
            emit("newAcceptSuccess", broadcast=False)
            user = self.User.get_user_by_uid(session['uId'])
            self.emit_to(
                "Accept", f"{msg['name']} has accepted you to follow.", msg["follow_id"])
            self.emit_to("concacts_interrupt", user, msg["follow_id"])

    def emit_commentInterrupt(self, comment, msg, type):
        print(msg)
        followings = self.Follow.get_following_by_uid_all(msg['user_id'])
        if session['uId'] != msg['user_id']:
            followings.remove(session['uId'])
            followings.append(msg['user_id'])
        print("followings", followings, session['uId'])
        for following in followings:
            self.emit_to('comment_Interrupt', self.default_json(
                {"type": type, "comment": comment, "user_id": session['uId'], "feed_id": msg['feed_id']}), following)

    def on_comment(self, msg):
        print("on_comment", msg)
        id = None
        try:
            id = self.Comment.new(
                feed_id=msg['feed_id'], user_id=session["uId"], content=msg['content'])
            print("ID", id)
        except IndexError:
            print(IndexError)
            emit("commentError", {'feed_id': msg['feed_id']}, broadcast=False)
        else:
            comment = self.Comment.get_comment_by_id(id)
            comment['user'] = self.User.get_user_by_uid(comment['user_id'])
            emit("commentSuccess", self.default_json(
                {'feed_id': msg['feed_id'], "comment": comment}), broadcast=False)
            self.emit_commentInterrupt(comment, msg,'add')

    def on_moreComment(self, msg):
        comment = self.get_comment(msg['feed_id'], 3, msg['comment_ids'])
        emit("moreComment", self.default_json(
            {"feed_id": msg['feed_id'], 'comment': comment}), broadcast=False)

    def emit_loveInterrupt(self, like, msg, type):
        followings = self.Follow.get_following_by_uid_all(msg['user_id'])
        if session['uId'] != msg['user_id']:
            followings.remove(session['uId'])
            followings.append(msg['user_id'])
        print("followings", followings, session['uId'])
        for following in followings:
            if type == 'add':
                self.emit_to('love_Interrupt', self.default_json(
                    {"like": like, "type": type, "user_id": session['uId'], "feed_id": msg['feed_id']}), following)
            else:
                self.emit_to('love_Interrupt', self.default_json(
                    {"type": type, "user_id": session['uId'], "feed_id": msg['feed_id']}), following)

    def on_love(self, msg):
        if self.Like.ensure(msg['feed_id'], session['uId']) < 1:
            like_new = self.Like.new(msg['feed_id'], session['uId'])
            like = self.Like.get_like_by_id(like_new)
            like['user'] = self.User.get_user_by_uid(session['uId'])
            emit("love", self.default_json(
                {"feed_id": msg['feed_id'], 'status': 'love', "like": like}), broadcast=False)
            self.emit_loveInterrupt(like, msg, 'add')
        else:
            self.Like.delete(msg['feed_id'], session['uId'])
            user = self.User.get_user_by_uid(session['uId'])
            emit("love", self.default_json(
                {"feed_id": msg['feed_id'], 'status': 'unLove', "user": user}), broadcast=False)
            self.emit_loveInterrupt(None, msg, 'delete')

    def on_delete_comment(self, msg):
        comment = self.Comment.get_comment_by_id_obj(msg['id'])
        res = {}
        if comment.user_id == session['uId']:
            self.Comment.delete(comment)
            res['comment'] = [{"id": i.id, "created_at": i.created_at, "feed_id": i.feed_id,
                               "user_id": i.user_id, "content": i.content} for i in [comment]][0]
            emit("delete_comment_success",
                 self.default_json(res), broadcast=False)
            self.emit_commentInterrupt(res, msg,'delete')
        else:
            res['comment'] = [{"id": i.id, "created_at": i.created_at, "feed_id": i.feed_id,
                               "user_id": i.user_id, "content": i.content} for i in [comment]][0]
            res['msg'] = {"msg": "You have no right to delete this comment."}
            emit("delete_comment_error", self.default_json(res), broadcast=False)

    def on_report(self, msg):
        try:
            self.Report.new(msg['feed_id'], session['uId'],
                            msg['text'], content_admin='')
        except IndexError:
            print(ImportError)
            emit("report_error", broadcast=False)
        else:
            emit("report_success", broadcast=False)

    def delete_image_firestorage(self, txt):
        arr1 = txt.split('"')
        for i in arr1:
            arr2 = i.split(",")
            for j in arr2:
                print('"feeds/" in  path', "feeds/" in j)
                if "feeds/" in j:
                    print("path", j)
                    self.storage.delete(j, token=self.token)

    def on_delete_feed(self, msg):
        feed = self.Feed.get_feeds_by_id(msg['feed_id'])
        if feed[0]['user_id'] == session['uId']:
            self.Feed.delete(msg['feed_id'])
            self.delete_image_firestorage(feed[0]['img1'])
            self.Like.delete_by_feed_id(msg['feed_id'])
            self.Comment.delete_by_feed_id(msg['feed_id'])
            self.Report.delete_by_feed_id(msg['feed_id'])
            emit("delete_feed_success", {
                 'feed_id': msg['feed_id']}, broadcast=False)
        else:

            emit("delete_feed_error", broadcast=False)

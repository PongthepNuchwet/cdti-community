from distutils.log import error
from click import command
from flask import request, session
from flask_socketio import Namespace, emit, send
import time
from bson import json_util
import json


class FeedsNamespace(Namespace):
    def __init__(self, namespace, db, Feed, Follow, Like, Comment, User):
        super().__init__(namespace)
        self.db = db
        self.Feed = Feed
        self.Follow = Follow
        self.Like = Like
        self.User = User
        self.Comment = Comment

    def emiting_profile(self):
        user = self.User.get_user_by_uid(session['uId'])
        emit("profile", user, broadcast=False)

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

    def get_secket_id_by_uid(self, uid):
        user = self.User.get_user_by_uid(uid)
        print(user)
        return user['socket_id']

    def remove_secket_id(self):
        try:
            self.User.remove_secket_id_by_uid(uid=session["uId"])
        except IndexError:
            print(IndexError)

    def update_secket_id(self, sid):
        print("update_secket_id")
        try:
            self.User.update_secket_id_by_uid(sid=sid,uid=session["uId"])
        except IndexError:
            print(IndexError)
        
    def concacts(self, follwing):
        concacts = self.User.get_users_by_in_uid(follwing)
        emit("concacts", concacts, broadcast=False)

    def get_like(self,feed_id):
        res = []
        likes = self.Like.get_like_by_feedId_all(feed_id)
        for data in likes :
            like = data
            like['user'] = self.User.get_user_by_uid(data['user_id'])
            res.append(like)
        return  res

    def get_comment(self,feed_id):
        res = []
        comments = self.Comment.get_comment_by_feedId_all(feed_id)
        for data in comments :
            comment = data
            comment['user'] = self.User.get_user_by_uid(data['user_id'])
            res.append(comment)

        return  res

    def default_json(self,data):
        return json.loads(json.dumps(data, default=json_util.default))

    def get_feeds(self, follwing):
        addMe = list(follwing)
        addMe.append(session['uId'])
        respone = []
        Feeds = self.Feed.get_feeds_by_in_uid(addMe)

        for data in Feeds:
            feed = data
            feed['like'] = self.get_like(data['id'])
            feed['comment'] = self.get_comment(data['id'])
            feed['user'] = self.User.get_user_by_uid(data['user_id'])
            respone.append(feed)
        
        return respone
    
    def emiting_feeds(self,follwing):
        res = self.get_feeds(follwing)
        emit("feeds", self.default_json(res), broadcast=False)
            

    def on_connect(self):
        start = time.time()
        follwing = self.Follow.get_following_by_uid_and_status_all(uid=session["uId"], state=1)
        self.emiting_feeds(follwing=follwing)
        self.emiting_profile()
        self.update_secket_id(request.sid)
        self.emiting_friend_recommend()
        self.emiting_friend_required()
        self.concacts(follwing)
        end = time.time()
        print("end - start", end - start)

    def on_disconnect(self):
        self.remove_secket_id()

    def on_message(self, msg):
        send(msg, broadcast=True)

    def on_newFeed(self, msg):
        try:
            print("msgimagePath",msg["imagePath"])
            self.Feed.new(
                content=msg["content"], img1=msg["imagePath"], uid=session["uId"])
        except IndexError:
            print(IndexError)
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

    def on_comment(self,msg):
        print("on_comment",msg)
        id = None
        try :
            id = self.Comment.new(feed_id= msg['feed_id'], user_id=session["uId"],content = msg['content'])
            print("ID",id)
        except IndexError :
            print(IndexError)
            emit("commentError", {'feed_id':msg['feed_id']}, broadcast=False)
        else :
            comment = self.Comment.get_comment_by_id(id)
            comment['user'] = self.User.get_user_by_uid(comment['user_id'])
            emit("commentSuccess",self.default_json( {'feed_id':msg['feed_id'],"comment":comment} ), broadcast=False)
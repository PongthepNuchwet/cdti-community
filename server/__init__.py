from flask import Flask, session, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from os import path
from flask_login import LoginManager

import pyrebase

from server.controllers.auth import Auth
from server.controllers.feeds import Feeds as News
from server.controllers.report import Report
from server.controllers.banlist import Banlist
from server.controllers.profile import Profile
from server.controllers.friends import Friends
from server.socket.feeds import FeedsNamespace
from server.socket.report import ReportNamespace
from server.socket.banlist import BanlistNamespace
from server.socket.follower import FollowerNamespace
from server.socket.following import FollowingNamespace
from server.socket.friends import FriendsNamespace
from server.model.User import UserModel
from server.model.Feed import FeedModel
from server.model.Follow import FollowModel
from server.model.Like import LikeModel
from server.model.Comment import CommentModel
from server.model.Report import ReportModel
from server.DB import db, Users, Feeds, Likes, Comments, Follow, Report as ReportDB


# db = SQLAlchemy(session_options={"autoflush": True})
DB_NAME = "database.db"


def create_app():

    app = Flask(__name__)
    app.config["SECRET_KEY"] = "12345678"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"

    db.init_app(app)
    
    create_database(app)

    user_model = UserModel(db, model=Users)
    feed_model = FeedModel(db, model=Feeds)
    follow_model = FollowModel(db, model=Follow)
    like_model = LikeModel(db, model=Likes)
    comment_model = CommentModel(db, model=Comments)
    report_model = ReportModel(db, model=ReportDB)

    login_manager = LoginManager()
    login_manager.login_view = "auth.sign_up"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(uid):
        return Users.query.get(int(uid))

    config = {
        "apiKey": "AIzaSyCHwDbEEyazcl_kuVnV5DY4Y-ouLi9Ai3o",
        "authDomain": "",
        "databaseURL": "",
        "storageBucket": "cdti-community.appspot.com",
        "serviceAccount": "server/firebase/cdti-community-firebase-adminsdk-zciij-897e877914.json"
    }
    firebase = pyrebase.initialize_app(config)
    storage = firebase.storage()
    auth = firebase.auth()
    email = "6310301004@cdti.ac.th"
    password = "6310301004"
    user = auth.sign_in_with_email_and_password(email, password)

    socketio = SocketIO(app, logger=True, engineio_logger=True,
                        async_handlers=True, async_mode='threading')
    socketio.on_namespace(FeedsNamespace(
        namespace="/feeds", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))
    socketio.on_namespace(ReportNamespace(
        namespace="/report", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))
    socketio.on_namespace(BanlistNamespace(
        namespace="/banlist", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))
    socketio.on_namespace(FollowerNamespace(
        namespace="/follower", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))
    socketio.on_namespace(FollowingNamespace(
        namespace="/following", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))
    socketio.on_namespace(FriendsNamespace(
        namespace="/friends", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model, Report=report_model, storage=storage,token=user['idToken']))

    auth = Auth(socketio=socketio,Feed=feed_model, Users=Users,Report=report_model, db=db, storage=storage,idToken=user['idToken'])
    news = News(storage=storage)
    report = Report()
    banlist = Banlist()
    profile = Profile()
    friends = Friends()

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(news, url_prefix="/feeds")
    app.register_blueprint(report, url_prefix="/report")
    app.register_blueprint(banlist, url_prefix="/banlist")
    app.register_blueprint(profile, url_prefix="/profile")
    app.register_blueprint(friends, url_prefix="/friends")


    return app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        db.create_all(app=app)
        print("Created Database!")

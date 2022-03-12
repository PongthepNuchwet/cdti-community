from flask import Flask, session, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from os import path
from flask_login import LoginManager
from dotenv import dotenv_values,load_dotenv

import pyrebase

from server.controllers.api import Api
from server.controllers.auth import Auth
from server.controllers.feeds import Feeds as News
from server.controllers.profile import Profile
from server.socket.feeds import FeedsNamespace
from server.model.User import UserModel
from server.model.Feed import FeedModel
from server.model.Follow import FollowModel
from server.model.Like import LikeModel
from server.model.Comment import CommentModel


db = SQLAlchemy(session_options={"autoflush": True})
DB_NAME = "database.db"

# def randomData(feed_model,like_model,comment_model) : 
#     feeds = feed_model.get_feeds_by_in_uid(1)
#     for data in feeds :
#         # for i in range(0.9):
#         like_model.new(feed_id=data['feed_id'], user_id=1)
#         comment_model.new(feed_id=data['feed_id'], user_id=1,content="AAAAAA")



def create_app():

    app = Flask(__name__)
    app.config["SECRET_KEY"] = "12345678"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"

    db.init_app(app)
    from server.DB import Users, Feeds, Likes, Comments, Follow
    create_database(app)
    
    user_model = UserModel(db, model=Users)
    feed_model = FeedModel(db, model=Feeds)
    follow_model = FollowModel(db, model=Follow)
    like_model = LikeModel(db, model=Likes)
    comment_model = CommentModel(db, model=Comments)

    # randomData(feed_model,like_model,comment_model)

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
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
    # user['idToken']

    socketio = SocketIO(app, logger=True, engineio_logger=True,
                        async_handlers=True, async_mode='threading')
    socketio.on_namespace(FeedsNamespace(
        namespace="/feeds", db=db, Feed=feed_model, Follow=follow_model, Like=like_model, Comment=comment_model, User=user_model))

    api = Api(storage=storage,idToken=user['idToken'])
    auth = Auth(socketio=socketio, Users=Users, db=db,storage=storage)
    news = News(storage=storage)
    profile = Profile()

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(news, url_prefix="/feeds")
    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(profile, url_prefix="/profile")

    return app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        db.create_all(app=app)
        print("Created Database!")

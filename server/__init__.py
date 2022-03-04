from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from os import path
from .controllers.auth import Auth
from .controllers.feeds import Feeds as News
from .socket.feeds import FeedsNamespace
from flask_login import LoginManager

db = SQLAlchemy()
DB_NAME = "database.db"


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "qwerty asdfgh zxcvbn"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    db.init_app(app)

    from .models import Users, Feeds, Likes, Comments, Follow
    create_database(app)

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(uid):
        return Users.query.get(int(uid))

    socketio = SocketIO(app, logger=True, engineio_logger=True,
                        async_handlers=True, async_mode='threading')
    socketio.on_namespace(FeedsNamespace(
        namespace="/feeds", db=db, Feeds=Feeds, Follow=Follow, Users=Users))

    auth = Auth(socketio=socketio, Users=Users, db=db)

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(News(), url_prefix="/feeds")

    return app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        db.create_all(app=app)
        print("Created Database!")

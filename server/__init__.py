from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send,emit
from os import path
from .socket.feeds import FeedsNamespace

from flask_login import LoginManager

db = SQLAlchemy()
DB_NAME = "database.db"


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "qwerty asdfgh zxcvbn"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    db.init_app(app)

    from .controllers.auth import auth
    from .controllers.feeds import feeds

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(feeds, url_prefix="/feeds")

    from .models import Users, Feeds, Likes, Comments, Follow

    create_database(app)

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return Users.query.get(int(id))

    socketio = SocketIO(app, logger=True, engineio_logger=True)
    socketio.on_namespace(FeedsNamespace('/feeds'))


    return  app
    # return socketio, app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        db.create_all(app=app)
        print("Created Database!")

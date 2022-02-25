from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, emit
from os import path
import pyrebase


from flask_login import LoginManager

db = SQLAlchemy()
DB_NAME = "database.db"

config = {
    "apiKey": "AIzaSyBYmdYyceE2nm2NI41_uA7WJqUXXOpupLc",
    "authDomain": "cdti-community.firebaseapp.com",
    "projectId": "cdti-community",
    "storageBucket": "cdti-community.appspot.com",
    "messagingSenderId": "389183905844",
    "appId": "1:389183905844:web:d72c864521858774e1aa61",
    "measurementId": "G-KPD21GSQ88",
    "databaseURL":'',
    "serviceAccount": {
        "type": "service_account",
        "project_id": "cdti-community",
        "private_key_id": "3036ac699eab5f77bbd43fe09b1d82d5065f5359",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRgRTtQ5uG1B0R\np9sBoY0EAz9uInqTDqGYHhDOIJL2jvJJxFY6V5o10Gwt7HeV35MyvUmo2bQoepGZ\nGiqYVBcttZlFnPLEiPdZRNd36Oo55sl0mtEiOFrHahTY4pYFD2ENwygtscqOXYy/\nhJBtuVxeXWW8YF/MAi07SWiwrG1jMVavSvF8TbKZGp0Xk+RrJ7r/4WqrbyKxw9We\nwyHO47j7u6IL2erneqc+wiBh17f0Tswkk4gcpvd/buJKQXa+MYN0qE8oDG7OVVBr\n9htg2BN3OEO5W9zp+rtNeCUHWiTHMDERuJufciH2bEQ762AX5MK0AFIEyiHUv/C8\ne3jftf8lAgMBAAECggEACpD2u+YGWLfR+itRFwqi0L+pL1DQhczdxuJH+V1t4WmM\nPBQ0P8pd82DeU+KdQBMqmrXZRTQrAJpN8D7VmcvZRMDn82QwX6EuIx50ZOPRDGKL\naTTLChggMUvfCUvu7QpoMV1/upjrnQqIKBCeMtUqch1GcvMZYcdU/gHRzzdNvQw5\n24xCGDAskojp4eFSVv75ItdJa0UB1X1cp9rv4FGn9Ix+ntoihaaCE0MPkQukMx86\nwtxGiqt+KL6xEC2FGqU4Ff/wcDi5YdjJZtDlGRS9Cr0GkX4HFlnu+M/6TOw3rP/L\ns23ygB4obQV+ooXPG6qUK1A0g/jWJQ2KsAs9gLZ1cQKBgQD+I67eBrsZKwHCiXI+\nF0v/VOjzC5pYT1K3/zOU6E+Tp6XVtd33MnGX66EjKZEKcGtsFo7H9KtujkWvgTT7\nVO+aLarN0a6T4M7P5wm792zErG1LtCtYZm+MUuBRElqLGT/YRcGmlwNkQl3Vqydb\n/qR8kygpVer39diH4bCBN25UZwKBgQDTCb3sfiy3/nQBrwg6mFODWZAlo3bVwdHq\n7Y8oeqYX1hBjrFxMHuhy1zkkJLdz4mwPCNOXCL3R7weZhU/RAc9h9EVlpjShak+f\nOG5KMTPlMKkz0tokIs5pUaAodpxQXlxPdZvUPZB3pfduDD06nOPCUNWxmh0QN6KM\n4B3f6NM4kwKBgQDb5QAveF93XXD+ZHMHKp1FZrDRa562/puyPQzisUf5mLuy+NQA\nShNjwiwBArxO7grk0Xflp9yVomDFhOTU+x7+prj9sYp+xavs1BnmHCZu3ksLj+9Z\nY/jsz+DsBRd29/f4KBNxE4WJwKr0cE10Ghc0+xdq/L58oqoimLNiexXpzQKBgQC+\nhPP19a6vaMMX5glaxLvYP9n3cMxOi8zT9yUfmSIrMLDZGvi0K88UJiLK826+6rE9\nHW3P0y9ywAUvXn/BI44yU1D3RIYNFynMhyhiSGseRMDsLTWMG/QWdn9NKE9T6uwR\nPA6zG+U5bxaiPeBk8tBXU5yn2obUZjWUUpwF0W4miwKBgQCXcJeEv3kfmExyrtkz\nNWPxwvFEbuaizEOytcjAptzzS0B38CQBupmMLZ/jrkmMfaShQTBJ5sbIaaO3ELYP\ntWoe55PrWn1prft1RW2n6PF+IHeqSL0daB3S+afrhrudIvWOq4LK0HpyxC77byqw\nHRuO+bEldJoDXFW3DeukGC+6eg==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-zciij@cdti-community.iam.gserviceaccount.com",
        "client_id": "103076553818582923497",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zciij%40cdti-community.iam.gserviceaccount.com",
    },
}

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "qwerty asdfgh zxcvbn"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    db.init_app(app)

    from .controllers.auth import Auth
    from .controllers.feeds import feeds
    from .socket.feeds import FeedsNamespace

    app.register_blueprint(feeds, url_prefix="/feeds")

    from .models import Users, Feeds, Likes, Comments, Follow

    create_database(app)

    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return Users.query.get(int(id))

    socketio = SocketIO(app, logger=True, engineio_logger=True, async_handlers=True)
    socketio.on_namespace(FeedsNamespace("/feeds"))

    auth = Auth(socketio=socketio)

    app.register_blueprint(auth, url_prefix="/")

    return app


def create_database(app):
    if not path.exists("website/" + DB_NAME):
        db.create_all(app=app)
        print("Created Database!")

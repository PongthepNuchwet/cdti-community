from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from flask_login import login_user, login_required, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
import os
import pathlib
import oauthlib

import requests
from flask import Flask, session, abort, redirect, request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests    

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

GOOGLE_CLIENT_ID = "684748119335-ij41pqcpn9tb5u0dj2jaqchscoklt7u4.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://cdti-community.herokuapp.com/callback"
)


def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  # Authorization required
        else:
            return function()

    return wrapper

def friend_recommend_interrupt(socketio, email, Users):
    user = [
        {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
        for i in [Users.query.filter_by(email=email).first()]
    ]
    print("user user ", user)
    socketio.emit("friend_recommend_interrupt", user[0], namespace='/feeds')

def new_name(name) :
    return str(uuid.uuid4()) + '.'+ str(name).split('.')[-1]

def new_namegg() :
    return str(uuid.uuid4()) + '.jpg'

def Auth(socketio, Users, db,storage,idToken):
    auth = Blueprint("auth", __name__)

    @auth.route("/")
    @login_required
    def home():
        return render_template("home.html")

    @auth.route("/login1", methods=["GET", "POST"])
    def login1():
        authorization_url, state = flow.authorization_url()
        session["state"] = state
        return redirect(authorization_url)

    @auth.route("/callback")
    def callback():
        flow.fetch_token(authorization_response=request.url)

        if not session["state"] == request.args["state"]:
            abort(500)  # State does not match!

        credentials = flow.credentials
        request_session = requests.session()
        cached_session = cachecontrol.CacheControl(request_session)
        token_request = google.auth.transport.requests.Request(session=cached_session)

        id_info = id_token.verify_oauth2_token(
            id_token=credentials._id_token,
            request=token_request,
            audience=GOOGLE_CLIENT_ID
        )

        user = Users.query.filter_by(email=id_info.get("email")).first()
        if not user:
            new_user = Users(
                profile=id_info.get("picture"),
                email=id_info.get("email"),
                fullName=id_info.get("name"),
            )
            db.session.add(new_user)
            db.session.commit()
            user = Users.query.filter_by(email=id_info.get("email")).first()
            friend_recommend_interrupt(
                socketio=socketio, email=id_info.get("email"), Users=Users)

        session["uName"] = id_info.get("name")
        session["email"] = id_info.get("email")
        session["uProfile"] = user.profile if user.profile is not None else ""
        login_user(user, remember=True)
        return redirect(url_for("feeds.home"))

    @auth.route("/banpage", methods=["GET", "POST"])
    def banpage():
        return render_template("banpage.html")
    
    @auth.route("/reports", methods=["GET", "POST"])
    def reports():
        return render_template("reports.html")

    @auth.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            email = request.form.get("email")
            password = request.form.get("password")
            user = Users.query.filter_by(email=email).first()
            idAdmin = ['Dream123@gmail.com']

            if user:
                if user.status == "2":
                    session["email"] = user.email
                    session["uProfile"] = user.profile if user.profile is not None else ""
                    return redirect(url_for("auth.banpage"))

                elif check_password_hash(user.password, password):
                    flash("Logout in successfully!", category="success")
                    session["uId"] = user.id
                    session["uName"] = user.fullName
                    session["email"] = user.email
                    session["uProfile"] = user.profile if user.profile is not None else ""
                    login_user(user, remember=True)
                    if email in idAdmin:
                        return redirect(url_for("auth.reports"))
                    else:   
                        return redirect(url_for("feeds.home"))

                else:
                    flash("Incorrect password ,try again", category="error")
            else:
                flash("Can't find your email", category="error")

        return redirect(url_for("auth.sign_up"))

    @auth.route("/logout")
    def logout():
        logout_user()
        return redirect(url_for("auth.sign_up"))

    @auth.route("/signup", methods=["GET", "POST"])
    def sign_up():
        if request.method == "POST":
            f = request.files.get("file")
            newName = secure_filename(new_name(f.filename))
            path = f"profile/{newName}"
            storage.child(path).put(f)
            imagepath = f"https://firebasestorage.googleapis.com/v0/b/cdti-community.appspot.com/o/profile%2F{newName}?alt=media"
            email = request.form.get("email")
            fullName = request.form.get("fullName")
            password1 = request.form.get("password1")
            password2 = request.form.get("password2")

            user = Users.query.filter_by(email=email).first()

            if user:
                flash("Email already exist", category="error")
            elif len(email) < 4:
                flash("Email must be greater than 3 characters.", category="error")
            elif len(fullName) < 2:
                flash("First name must be greater than 1 character.",
                      category="error")
            elif password1 != password2:
                flash("Passwords don't match.", category="error")
            elif len(password1) < 7:
                flash("Password must be at least 7 characters.", category="error")
            else:
                new_user = Users(
                    profile=imagepath,
                    email=email,
                    fullName=fullName,
                    password=generate_password_hash(
                        password1, method="sha256"),
                )
                db.session.add(new_user)
                db.session.commit()
                friend_recommend_interrupt(
                    socketio=socketio, email=email, Users=Users)
                    
                flash("Account created!", category="success")
                return redirect(url_for("auth.sign_up"))

        return render_template("signup.html")

    return auth

from urllib.parse import urldefrag
from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from flask_socketio import emit
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os


from ..models import Users
from .. import db 

def friend_recommend_interrupt(socketio,email):
        user = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email}
            for i in [Users.query.filter_by(email=email).first()]
        ]
        print("user user ",user)
        socketio.emit("friend_recommend_interrupt", user[0],namespace='/feeds')

def  Auth(socketio):
    auth = Blueprint("auth", __name__)

    @auth.route("/")
    @login_required
    def home():
        return render_template("home.html")


    @auth.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            email = request.form.get("email")
            password = request.form.get("password")
            user = Users.query.filter_by(email=email).first()
            if user:
                if check_password_hash(user.password, password):
                    flash("Logged in successfully!", category="success")
                    session["uId"] = user.id
                    session["uName"] = user.fullName
                    session["email"] = user.email
                    session["uProfile"] = user.profile if user.profile != None else ""
                    login_user(user, remember=True)
                    return redirect(url_for("feeds.home"))
                else:
                    flash("Incorrect password ,try align", category="error")
            else:
                flash("Email does not exist", category="error")

        return render_template("login.html")


    @auth.route("/logout")
    def logout():
        logout_user()
        return redirect(url_for("auth.login"))


    @auth.route("/signup", methods=["GET", "POST"])
    def sign_up():
        if request.method == "POST":
            f = request.files.get("file")
            newName = secure_filename(f.filename)
            profilePath = f"/static/profile/{newName}"
            f.save(os.path.join("server/static/profile/", newName))


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
                flash("First name must be greater than 1 character.", category="error")
            elif password1 != password2:
                flash("Passwords don't match.", category="error")
            elif len(password1) < 7:
                flash("Password must be at least 7 characters.", category="error")
            else:
                new_user = Users(
                    profile=profilePath,
                    email=email,
                    fullName=fullName,
                    password=generate_password_hash(password1, method="sha256"),
                )
                db.session.add(new_user)
                db.session.commit()
                friend_recommend_interrupt(socketio=socketio,email=email)
                flash("Account created!", category="success")
                return redirect(url_for("auth.login"))

        return render_template("signup.html")
    
    return auth
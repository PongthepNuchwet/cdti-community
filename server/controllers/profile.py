from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Profile():
    profile = Blueprint("profile", __name__)

    @profile.route("/<uid>")
    #@login_required
    def home(uid):
        return render_template("profile.html")

    @profile.route("/follower")
    #@login_required
    def follower():
        return render_template("follower.html")

    @profile.route("/following")
    #@login_required
    def following():
        return render_template("following.html")
        
    return profile

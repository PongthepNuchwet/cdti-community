from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Friend():
    friend = Blueprint("friends", __name__)

    @friend.route("/")
    @login_required
    def home():
        return render_template("friends.html")

    return friend

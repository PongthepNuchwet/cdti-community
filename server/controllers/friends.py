from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Friends():
    friends = Blueprint("friends", __name__)

    @friends.route("/")
    @login_required
    def search():
        return render_template("friends.html")


    return friends

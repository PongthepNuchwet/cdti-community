from distutils.command.upload import upload
from flask import Blueprint, render_template, request, jsonify, session
from flask_login import login_required
from werkzeug.utils import secure_filename
import os

from ..models import Feeds
from .. import db


feeds = Blueprint("feeds", __name__)


@feeds.route("/")
@login_required
def home():
    return render_template("feeds.html")


@feeds.route("/upload", methods=["GET", "POST"])
def handle_upload():
    if request.method == "POST":
        imgPath = []
        for key, f in request.files.items():
            if key.startswith("file"):
                newName = secure_filename(f.filename)
                imgPath.append(f"/static/feedImage/{newName}")
                f.save(os.path.join("server/static/feedImage/", newName))
        return jsonify(imgPath=imgPath)
    else:
        return "upload"

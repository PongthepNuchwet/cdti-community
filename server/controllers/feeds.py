from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def new_name(name) :
    return str(uuid.uuid4()) + '.'+ str(name).split('.')[-1]

def Feeds(storage):
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
                    # newName = secure_filename(f.filename)
                    newName = secure_filename(new_name(f.filename))
                    profilePath = f"feeds/{newName}"
                    imgPath.append(profilePath)
                    storage.child(profilePath).put(f)
                    # f.save(os.path.join("server/static/feedImage/", newName))
            return jsonify(imgPath=imgPath)
        else:
            return "upload"

    return feeds

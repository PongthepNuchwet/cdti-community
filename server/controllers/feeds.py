from distutils.command.upload import upload
from flask import Blueprint, render_template, request,jsonify
from werkzeug.utils import secure_filename
import os

from ..models import Feeds
from .. import db


feeds = Blueprint('feeds', __name__)


@feeds.route('/')
def home():
    return render_template("feeds.html")


@feeds.route('/upload', methods=['GET', 'POST'])
def handle_upload():
    if request.method == 'POST':
        imgPath = []
        for key, f in request.files.items():
            if key.startswith('file'):
                path = os.path.join("server/static/uploads/",secure_filename(f.filename))
                imgPath.append(path)
                f.save(path)
        return jsonify(imgPath=imgPath)
    else :
        return "upload"
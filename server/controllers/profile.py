from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Profile():
    profile = Blueprint("profile", __name__)

    @profile.route("/")
    #@login_required
    def home():
        return render_template("profile.html")

    return profile

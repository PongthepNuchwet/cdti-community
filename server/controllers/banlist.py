from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Banlist():
    banlists = Blueprint("banlists", __name__)

    @banlists.route("/")
    ##@login_required
    def banlist():
        return render_template("banlists.html")


    return banlists
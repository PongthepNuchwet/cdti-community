from flask import Blueprint, render_template, request, jsonify ,session ,redirect, url_for
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid


def Banlist():
    banlists = Blueprint("banlists", __name__)

    @banlists.route("/")
    # @login_required
    def banlist():
        if session['type'] == 'admin':
            return render_template("banlists.html")
        else :
            return redirect(url_for("auth.logout"))
        
    return banlists
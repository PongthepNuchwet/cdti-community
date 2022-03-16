from flask import Blueprint, render_template, request, jsonify ,session ,redirect, url_for
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Report():
    report = Blueprint("reports", __name__)

    @report.route("/")
    # @login_required
    def reports():
        print("session['type']",session['type'])
        if session['type'] == 'admin':
            return render_template("reports.html")
        else :
            return redirect(url_for("auth.logout"))
    return report
    
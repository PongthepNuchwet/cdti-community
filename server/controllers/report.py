from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from werkzeug.utils import secure_filename
import os
import uuid

def Report():
    report = Blueprint("reports", __name__)

    @report.route("/")
    ##@login_required
    def reports():
        return render_template("reports.html")


    return report
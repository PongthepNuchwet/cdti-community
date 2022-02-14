from flask import Blueprint, render_template, request, flash , redirect,url_for
from flask_login import login_user, login_required,logout_user,current_user

feeds = Blueprint('feeds', __name__)

@feeds.route('/')
def home():
    return render_template("./feeds/index.html")
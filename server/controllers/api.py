from flask import Blueprint, request, send_file
from flask_login import login_required
import requests
from io import BytesIO


def Api(storage, idToken):
    api = Blueprint("api", __name__)

    @api.route("/profile", methods=["GET"])
    @login_required
    def profile():
        file = request.args.get('file')
        if 'profile/' in file :
            url = storage.child(file).get_url(idToken)
            print(url)
        else :
            url = file
        response = requests.get(url)

        return send_file(
            BytesIO(response.content),
            mimetype='image/jpeg',
            as_attachment=False)

    @api.route("/image", methods=["GET"])
    @login_required
    def image():
        file = request.args.get('file')
        url = storage.child(file).get_url(idToken)
        response = requests.get(url)
        return send_file(
            BytesIO(response.content),
            mimetype='image/jpeg',
            as_attachment=False)
    return api


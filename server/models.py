from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func


class Users(db.Model, UserMixin):

    id = db.Column(db.Integer, primary_key=True)
    profile = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    fullName = db.Column(db.String(150))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    update_at = db.Column(db.DateTime(timezone=True), default=func.now())

    feeds = db.relationship("Feeds")
    likes = db.relationship("Likes")
    comments = db.relationship("Comments")
    follow = db.relationship("Follow")

    def __repr__(self):
        return "<User %r>" % self.fullName


class Feeds(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300))
    img1 = db.Column(db.String(50))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    update_at = db.Column(db.DateTime(timezone=True), default=func.now())

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    likes = db.relationship("Likes")
    comments = db.relationship("Comments")

    def __repr__(self):
        return "<Feeds %r>" % self.id


class Likes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())

    feed_id = db.Column(db.Integer, db.ForeignKey("feeds.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def __repr__(self):
        return "<Likes %r>" % self.id


class Comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(300))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    
    feed_id = db.Column(db.Integer, db.ForeignKey("feeds.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def __repr__(self):
        return "<Comments %r>" % self.id


class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    following = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def __repr__(self):
        return "<Follow %r>" % self.id

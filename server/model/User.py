
from itertools import count
from flask import flash
from sqlalchemy import false
from sqlalchemy.sql import func

class UserModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.User = model

    def like_by_nameans_notid(self,query,uid):
        users = self.User.query.filter(self.User.fullName.like(f'%{query}%'),self.User.id.isnot(uid)).limit(10).all()
        print(len(users))
        if len(users) > 0 :
            res = []
            for user in users :
                res.append({"id": user.id, "profile": user.profile, "fullName": user.fullName, "email": user.email, "socket_id": user.socket_id, "status": user.status, "type": user.type ,"namespace": user.namespace})
            return res
        else :
            return False
   

    def get_count_by_status(self, status):
        return self.User.query.filter_by(status=status).count()

    def get_user_by_status(self, status):
        data = [
            {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email, "socket_id": i.socket_id, "status": i.status, "type": i.type} for i in self.User.query.filter_by(status=status).order_by(self.db.desc(self.User.status_at)).all()
        ]

        return data

    def set_status_user(self, id, status):
        user = self.User.query.filter_by(id=id).first()
        user.status = status
        user.status_at = func.now()
        self.db.session.commit()

    def update_socket_id_by_uid(self, sid, uid , namespace):
        print("update_socket_id_by_uid", sid, uid)
        user = self.User.query.filter_by(id=uid).first()
        user.socket_id = sid
        user.namespace = namespace
        self.db.session.commit()

    def remove_socket_id_by_uid(self, uid):
        user = self.User.query.filter_by(id=uid).first()
        user.socket_id = None
        self.db.session.commit()

    def get_user_by_uid(self, uid):
        try :
            data = [
                {"id": i.id, "profile": i.profile, "fullName": i.fullName, "email": i.email, "socket_id": i.socket_id, "status": i.status, "type": i.type ,"namespace": i.namespace}  for i in
                [self.User.query.filter_by(id=uid).first()]
            ]
            return data[0]
        except:
            return False

    def get_users_by_in_uid(self, uids):
        data = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email}
            for i in self.User.query.filter(self.User.id.in_(uids)).all()
        ]
        return data

    def get_users_by_notin_uids_and_limit(self, uids, limit):
        data = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email} for i in self.User.query.filter(self.User.id.notin_(uids)).limit(limit).all()
        ]
        return data
    def get_users_by_notin_uids(self, uids):
        data = [
            {"id": i.id, "profile": i.profile,
                "fullName": i.fullName, "email": i.email} for i in self.User.query.filter(self.User.id.notin_(uids)).all()
        ]
        return data

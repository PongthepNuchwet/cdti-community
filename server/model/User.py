class UserModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.User = model

    def update_secket_id_by_uid(self, sid, uid):
        print("update_secket_id_by_uid",sid, uid )
        user = self.User.query.filter_by(id=uid).first()
        user.socket_id = sid
        self.db.session.commit()

    def remove_secket_id_by_uid(self, uid):
        user = self.User.query.filter_by(id=uid).first()
        user.socket_id = None
        self.db.session.commit()

    def get_user_by_uid(self, uid):
        data = [
            {"id": i.id,"profile": i.profile, "fullName": i.fullName, "email": i.email,"socket_id":i.socket_id} for i in
            [self.User.query.filter_by(id=uid).first()]
        ]
        return data[0]

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

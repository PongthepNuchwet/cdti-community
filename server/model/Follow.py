class FollowModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Follow = model

    def new(self, following, uid, status):
        new_Follow = self.Follow(
            following=following, user_id=uid, status=status
        )
        print("new_Follow",new_Follow)
        self.db.session.add(new_Follow)
        self.db.session.commit()

    def update_status_by_following_uid_status(self, following, user_id, status):
        new_accept = self.Follow.query.filter_by(
            following=following, user_id=user_id, status=status
        ).first()
        new_accept.status = 1
        self.db.session.commit()

    def get_uids_by_following_and_status(self, uids, state):
        data = [
            i.user_id for i in self.Follow.query.filter_by(following=uids, status=state).all()
        ]
        return data

    def get_following_by_uid_all(self, uid):
        data = [
            i.following for i in self.Follow.query.filter_by(user_id=uid).all()
        ]
        return data

    def get_following_by_uid_and_status_all(self, uid, state):
        data = [
            i.following for i in self.Follow.query.filter_by(user_id=uid, status=state).all()
        ]
        return data

class LikeModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Like = model

    def get_like_by_feedId_all(self, id):
        data = self.Like.query.filter_by(feed_id=id).all()
        return data

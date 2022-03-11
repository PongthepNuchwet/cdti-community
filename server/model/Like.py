class LikeModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Like = model

    def new(self, feed_id, user_id):
        new_like = self.Feed(
            feed_id=feed_id,
            user_id=user_id
        )
        self.db.session.add(new_like)
        self.db.session.commit()

    def get_like_by_feedId_all(self, id):
        data = [{"id": i.id, "created_at": i.created_at,
                 "feed_id": i.feed_id, "user_id": i.user_id}
                for i in list(self.Like.query.filter_by(feed_id=id).all())
                ]
        return data

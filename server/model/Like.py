class LikeModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Like = model

    def new(self, feed_id, user_id):
        new_like = self.Like(
            feed_id=feed_id,
            user_id=user_id
        )
        self.db.session.add(new_like)
        self.db.session.commit()
        return new_like.id

    def delete(self, feed_id, user_id):
        like = self.Like.query.filter_by(feed_id=feed_id,user_id=user_id).first()
        self.db.session.delete(like)
        self.db.session.commit()

    def ensure(self,feed_id,uid):
        data = self.Like.query.filter_by(feed_id=feed_id,user_id=uid).count()
        return data

    def get_like_by_feedId_all(self, id):
        data = [{"id": i.id, "created_at": i.created_at,
                 "feed_id": i.feed_id, "user_id": i.user_id}
                for i in list(self.Like.query.filter_by(feed_id=id).all())
                ]
        return data

    def get_like_by_id(self, id):
        data = [{"id": i.id, "created_at": i.created_at,
                 "feed_id": i.feed_id, "user_id": i.user_id}
                for i in [self.Like.query.filter_by(id=id).first()]
                ]
        return data[0]

    def get_count_by_feedId(self, id):
        data = self.Like.query.filter_by(feed_id=id).count()
        return data

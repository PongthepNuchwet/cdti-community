class CommentModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Comment = model

    def new(self, feed_id, user_id,content):
        new_comment = self.Comment(
            feed_id=feed_id,
            user_id=user_id,
            content=content
        )
        self.db.session.add(new_comment)
        self.db.session.commit()

    def get_comment_by_feedId_all(self, id):
        data = [{"id": i.id, "created_at": i.created_at,
                "feed_id": i.feed_id, "user_id": i.user_id, "content": i.content}
                for i in list(self.Comment.query.filter_by(feed_id=id).order_by(self.db.desc(self.Comment.created_at)).all())
                ]
        return data

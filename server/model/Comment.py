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
        print("new ",new_comment.id)
        return new_comment.id

    def delete(self,comment_obj):
        self.db.session.delete(comment_obj)
        self.db.session.commit()

    def delete_by_feed_id(self,feed_id):
        comments = self.Comment.query.filter_by(feed_id=feed_id).all()
        for comment in comments :
            self.db.session.delete(comment)
            self.db.session.commit()
        

    def get_comment_by_feedId_all(self, id):
        data = [{"id": i.id, "created_at": i.created_at,
                "feed_id": i.feed_id, "user_id": i.user_id, "content": i.content}
                for i in list(self.Comment.query.filter_by(feed_id=id).order_by(self.db.desc(self.Comment.created_at)).all())
                ]
        return data

    def get_count_by_feedId(self, id):
        data = self.Comment.query.filter_by(feed_id=id).count()
        return data

    def get_comment_by_id_obj(self, id):
        data = self.Comment.query.filter_by(id=id).first()
        return data

    def get_comment_by_id(self, id):
        data = [ {"id": i.id, "created_at": i.created_at,"feed_id": i.feed_id, "user_id": i.user_id, "content": i.content} for i in [self.Comment.query.filter_by(id=id).first() ]]
        return data[0]
    

    def get_comment_by_feedId_limit_notin(self,id,limit,notin):
        
        data = [{"id": i.id, "created_at": i.created_at,
                "feed_id": i.feed_id, "user_id": i.user_id, "content": i.content}
                for i in list(self.Comment.query.filter(self.Comment.feed_id.is_(id),self.Comment.id.notin_(notin)).order_by(self.db.desc(self.Comment.created_at)).limit(limit).all())
                ]
        return data

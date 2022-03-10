import json


class FeedModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Feed = model

    def new(self, content, img1, uid):
        new_feed = self.Feed(
            content=content,
            img1=json.dumps(img1),
            user_id=uid,
        )
        self.db.session.add(new_feed)
        self.db.session.commit()

    def get_feeds_all(self):
        data = [
            {"id": i.id, "content": i.content,
                "img1": i.img1, "created_at": i.created_at}
            for i in [self.Feed.query.all()]
        ]
        return data

    def get_feeds_by_in_uid(self, uids):
        data = [
            {"id": i.id, "content": i.content,
                "img1": i.img1, "created_at": i.created_at , "user_id": i.user_id}
            for i in list(self.Feed.query.filter(self.Feed.user_id.in_(uids)).order_by(self.db.desc(self.Feed.created_at)).all())
        ]
        return data

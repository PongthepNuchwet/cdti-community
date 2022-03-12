class ReportModel:
    def __init__(self, db, model) -> None:
        self.db = db
        self.Report = model

    def new(self, feed_id, user_id,content_user='',content_admin=''):
        new_like = self.Report(
            feed_id=feed_id,
            user_id=user_id,
            content_user=content_user,
            content_admin=content_admin,
        )
        self.db.session.add(new_like)
        self.db.session.commit()
        return new_like.id

    def delete_by_feed_id(self,feed_id):
        reports = self.Report.query.filter_by(feed_id=feed_id).all()
        for report in reports :
            self.db.session.delete(report)
            self.db.session.commit()



from sqlalchemy.sql import func
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
    
    def set_status_admin(self,id,status):
        report = self.Report.query.filter_by(id=id).first()
        report.status_admin = status 
        self.db.session.commit()

    def set_status_content(self,id,content):
        report = self.Report.query.filter_by(id=id).first()
        report.content_admin = content
        report.update_at = func.now()
        self.db.session.commit()

    def delete_by_feed_id(self,feed_id):
        reports = self.Report.query.filter_by(feed_id=feed_id).all()
        for report in reports :
            self.db.session.delete(report)
            self.db.session.commit()

    def get_count(self):
        return self.Report.query.count()

    def get_report(self):
        reports = [
            {"id":i.id ,"content_user":i.content_user,"content_admin":i.content_admin,"created_at":i.created_at,"feed_id":i.feed_id,"user_id":i.user_id,"status_admin":i.status_admin,"status_user":i.status_user,"content_appeal":i.content_appeal} for i in self.Report.query.order_by(self.db.desc(self.Report.update_at)).all()
        ]
        return reports



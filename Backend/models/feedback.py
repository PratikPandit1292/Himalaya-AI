from models.database import db
from datetime import datetime


class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True   # feedback allowed without login
    )
    destination = db.Column(db.String(200), nullable=False)
    travel_date = db.Column(db.String(20), nullable=False)
    predicted_crowd = db.Column(db.String(20), nullable=False)
    actual_crowd = db.Column(db.String(20), nullable=True)
    accuracy_rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "destination": self.destination,
            "travel_date": self.travel_date,
            "predicted_crowd": self.predicted_crowd,
            "actual_crowd": self.actual_crowd,
            "accuracy_rating": self.accuracy_rating,
            "created_at": self.created_at.isoformat()
        }

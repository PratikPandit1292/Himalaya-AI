from models.database import db
from datetime import datetime
import json


class SavedItinerary(db.Model):
    __tablename__ = "saved_itineraries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    days = db.Column(db.Integer, nullable=False)
    people = db.Column(db.Integer, nullable=False)
    interests = db.Column(db.Text, nullable=False)       # JSON array
    start_date = db.Column(db.String(20), nullable=True)
    traveler_profile = db.Column(db.String(100))
    estimated_cost = db.Column(db.Integer)
    ai_narrative = db.Column(db.Text)
    itinerary_json = db.Column(db.Text)                  # Full JSON blob
    hidden_gem_name = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "days": self.days,
            "people": self.people,
            "interests": json.loads(self.interests),
            "start_date": self.start_date,
            "traveler_profile": self.traveler_profile,
            "estimated_cost": self.estimated_cost,
            "ai_narrative": self.ai_narrative,
            "hidden_gem_name": self.hidden_gem_name,
            "created_at": self.created_at.isoformat()
        }

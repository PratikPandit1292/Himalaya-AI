from flask import Blueprint, request, jsonify
from models.database import db
from models.feedback import Feedback

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["destination", "travel_date", "predicted_crowd", "accuracy_rating"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    rating = data["accuracy_rating"]
    if not (1 <= int(rating) <= 5):
        return jsonify({"error": "accuracy_rating must be 1-5"}), 400

    feedback = Feedback(
        destination=data["destination"],
        travel_date=data["travel_date"],
        predicted_crowd=data["predicted_crowd"],
        actual_crowd=data.get("actual_crowd"),
        accuracy_rating=int(rating)
    )

    db.session.add(feedback)
    db.session.commit()

    return jsonify({
        "message": "Thank you! Your feedback helps improve our predictions.",
        "id": feedback.id
    }), 201


@feedback_bp.route("/api/feedback/stats", methods=["GET"])
def feedback_stats():
    """Public endpoint showing overall model accuracy stats."""
    total = Feedback.query.count()
    if total == 0:
        return jsonify({"total_ratings": 0, "avg_rating": None})

    from sqlalchemy import func
    avg = db.session.query(func.avg(Feedback.accuracy_rating)).scalar()
    dist = {}
    for i in range(1, 6):
        dist[str(i)] = Feedback.query.filter_by(accuracy_rating=i).count()

    return jsonify({
        "total_ratings": total,
        "avg_rating": round(float(avg), 2),
        "distribution": dist
    })

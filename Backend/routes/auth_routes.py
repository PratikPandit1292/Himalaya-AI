from flask import Blueprint, request, jsonify
from models.database import db
from models.user import User
from models.saved_itinerary import SavedItinerary
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
import bcrypt
import json

auth_bp = Blueprint("auth", __name__)
user_bp = Blueprint("user", __name__)


# ─────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([name, email, password]):
        return jsonify({"error": "Name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user = User(name=name, email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": user.to_dict()
    }), 201


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": user.to_dict()
    })


# ─────────────────────────────────────────────
# USER ITINERARY ROUTES
# ─────────────────────────────────────────────

@user_bp.route("/api/user/itineraries", methods=["GET"])
@jwt_required()
def get_itineraries():
    user_id = int(get_jwt_identity())
    items = SavedItinerary.query.filter_by(user_id=user_id)\
        .order_by(SavedItinerary.created_at.desc()).all()
    return jsonify([i.to_dict() for i in items])


@user_bp.route("/api/user/itineraries", methods=["POST"])
@jwt_required()
def save_itinerary():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    itinerary = SavedItinerary(
        user_id=user_id,
        days=data.get("days", 0),
        people=data.get("people", 1),
        interests=json.dumps(data.get("interests", [])),
        start_date=data.get("start_date"),
        traveler_profile=data.get("traveler_profile"),
        estimated_cost=data.get("estimated_cost"),
        ai_narrative=data.get("ai_narrative"),
        itinerary_json=json.dumps(data.get("itinerary", {})),
        hidden_gem_name=data.get("hidden_gem", {}).get("place_name") if data.get("hidden_gem") else None
    )

    db.session.add(itinerary)
    db.session.commit()

    return jsonify({"message": "Itinerary saved!", "id": itinerary.id}), 201

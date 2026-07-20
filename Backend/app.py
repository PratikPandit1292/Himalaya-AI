from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Import all blueprints
from routes.prediction_routes import prediction_bp
from routes.itinerary_routes import itinerary_bp
from routes.weather_routes import weather_bp
from routes.pdf_routes import pdf_bp
from routes.feedback_routes import feedback_bp
from routes.auth_routes import auth_bp, user_bp
from routes.recommendation_routes import recommendation_bp
from routes.chat_routes import chat_bp
from routes.advisor_routes import advisor_bp

# Import DB + models
from models.database import db
from models.user import User
from models.saved_itinerary import SavedItinerary
from models.feedback import Feedback


def create_app():
    app = Flask(__name__)

    # ── Config ──────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///himalaya.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "himalaya-super-secret-key"
    )

    # ── Extensions ──────────────────────────────────────────
    CORS(app)
    db.init_app(app)
    JWTManager(app)

    # ── Register Blueprints ─────────────────────────────────
    app.register_blueprint(prediction_bp)
    app.register_blueprint(itinerary_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(pdf_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(recommendation_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(advisor_bp)

    # ── Create DB tables ────────────────────────────────────
    with app.app_context():
        db.create_all()
        print("[DB] Tables created / verified.")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )
from flask import Blueprint, request, jsonify
from services.chat_service import get_chat_response

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])   # list of {role, content}

    if not message:
        return jsonify({"error": "message is required"}), 400

    response, powered_by = get_chat_response(message, history)
    return jsonify({"response": response, "powered_by": powered_by})

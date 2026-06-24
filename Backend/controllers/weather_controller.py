from flask import request, jsonify
from services.weather_service import get_current_weather


def get_weather():
    location = request.args.get("location", "Gangtok")
    data = get_current_weather(location)
    return jsonify(data)

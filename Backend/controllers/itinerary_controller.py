from flask import request, jsonify
from services.itinerary_service import generate_complete_itinerary


def generate_itinerary(data):
    days = int(data.get("days", 3))
    people = int(data.get("people", 1))
    interests = data.get("interests", [])
    start_date = data.get("start_date", None)

    source_city = data.get("source_city", "")

    result = generate_complete_itinerary(
        days=days,
        people=people,
        interests=interests,
        source_city=source_city,
        start_date=start_date
    )

    return result
from flask import request, jsonify
from agents.itinerary_agent.graph import run_itinerary_agent


def generate_itinerary(data):
    days = int(data.get("days", 3))
    people = int(data.get("people", 1))
    interests = data.get("interests", [])
    start_date = data.get("start_date", None)

    source_city = data.get("source_city", "")

    result = run_itinerary_agent(
        days=days,
        people=people,
        interests=interests,
        source_city=source_city,
        start_date=start_date
    )

    return result
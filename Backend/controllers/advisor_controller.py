from flask import request, jsonify
from services.advisor_service import get_smart_advice


def smart_predict():
    data = request.get_json()
    destination = data.get("destination")
    date = data.get("date")

    result = get_smart_advice(destination, date)

    return jsonify({
        "destination": destination,
        "date": date,
        "prediction": result["prediction"],
        "narration": result["narration"],
        "alternatives_tried": result["alternatives_tried"],
        "best_alternative": result["best_alternative"],
        "recommendation": result["final_recommendation"],
    })
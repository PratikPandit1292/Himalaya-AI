from flask import request, jsonify
from services.predictor_service import get_prediction


def predict():
    data = request.get_json()
    destination = data.get("destination")
    date = data.get("date")

    result = get_prediction(destination, date)

    crowd_level = result["crowd_level"]

    crowd_emoji = (
        "🟢" if crowd_level == "Low"
        else "🟡" if crowd_level == "Medium"
        else "🔴"
    )

    result["crowd_emoji"] = crowd_emoji

    result["recommendation"] = (
        "Ideal time to visit — lower tourist density means peaceful exploration."
        if crowd_level == "Low"
        else "Moderate crowds expected. Book accommodation in advance."
        if crowd_level == "Medium"
        else "Expect heavy crowds. Plan ahead, book early, and arrive before 8am."
    )

    result["travel_tips"] = (
        "Start early and carry essentials. "
        "High altitude areas require acclimatisation — spend your first night in Gangtok."
    )

    # shap_factors already included by predict_trip()
    return jsonify(result)
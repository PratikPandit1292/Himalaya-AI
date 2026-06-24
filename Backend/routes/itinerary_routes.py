from flask import Blueprint, request, jsonify

from controllers.itinerary_controller import (
    generate_itinerary
)

itinerary_bp = Blueprint(
    "itinerary",
    __name__
)


@itinerary_bp.route(
    "/api/itinerary/generate",
    methods=["POST"]
)
def generate():

    data = request.get_json()

    result = generate_itinerary(data)

    return jsonify(result)
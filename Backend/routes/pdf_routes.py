from flask import Blueprint, request, jsonify, make_response
from services.pdf_service import generate_itinerary_pdf

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/api/itinerary/download-pdf", methods=["POST"])
def download_pdf():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No itinerary data provided"}), 400

    try:
        pdf_bytes = generate_itinerary_pdf(data)

        response = make_response(pdf_bytes)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = (
            "attachment; filename=himalaya_itinerary.pdf"
        )
        return response

    except Exception as e:
        print(f"[PDF] Generation error: {e}")
        return jsonify({"error": str(e)}), 500

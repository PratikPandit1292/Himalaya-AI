from flask import Blueprint, request, jsonify
from ml.recommender import get_recommender

recommendation_bp = Blueprint("recommendation", __name__)


@recommendation_bp.route("/api/recommend/search", methods=["GET"])
def nlp_search():
    """
    Natural Language Search using TF-IDF + Cosine Similarity.
    GET /api/recommend/search?q=peaceful+monastery+with+mountain+views
    """
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Please provide a search query via ?q=..."}), 400

    top_k = int(request.args.get("top_k", 6))
    rec = get_recommender()
    results = rec.search(query, top_k=top_k)

    return jsonify({
        "query": query,
        "result_count": len(results),
        "results": results,
        "technique": "TF-IDF Vectorization + Cosine Similarity",
    })


@recommendation_bp.route("/api/recommend/best-dates", methods=["GET"])
def best_dates():
    """
    Crowd-Optimal Date Finder using the trained Random Forest model.
    GET /api/recommend/best-dates?destination=Tsomgo+Lake
    """
    destination = request.args.get("destination", "").strip()
    if not destination:
        return jsonify({"error": "Please provide ?destination=..."}), 400

    n_days = int(request.args.get("days", 30))
    rec = get_recommender()
    result = rec.get_best_visit_dates(destination, n_days=n_days)

    if "error" in result:
        return jsonify(result), 404

    result["technique"] = "Random Forest Classifier — 30-day crowd forecasting"
    return jsonify(result)


@recommendation_bp.route("/api/recommend/circuits", methods=["GET"])
def travel_circuits():
    """
    K-Means clustered travel circuits.
    GET /api/recommend/circuits
    """
    rec = get_recommender()
    circuits = rec.get_travel_circuits()

    return jsonify({
        "circuits": circuits,
        "technique": "K-Means Clustering (k=3) on altitude, popularity, cost and duration features",
        "total_destinations": sum(c["place_count"] for c in circuits.values()),
    })

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import joblib
import json
from datetime import datetime, timedelta

DATASET_PATH = Path("datasets/tourism/attractions.csv")

# ─────────────────────────────────────────────────────────
# Smart Recommender — 3 ML techniques in one class
# ─────────────────────────────────────────────────────────

class SmartRecommender:
    """
    Combines:
    1. TF-IDF + Cosine Similarity  →  Natural Language Search
    2. Random Forest predictions   →  Crowd-Optimal Date Finder
    3. K-Means Clustering          →  Travel Circuits
    """

    def __init__(self):
        self.df = None
        self.tfidf = None
        self.tfidf_matrix = None
        self.kmeans = None
        self.circuits = None
        self._build()

    def _build(self):
        self.df = pd.read_csv(DATASET_PATH)

        # Build TF-IDF corpus from description + category + region
        corpus = (
            self.df["description"].fillna("") + " " +
            self.df["category"].fillna("") + " " +
            self.df["region"].fillna("") + " " +
            self.df["best_time"].fillna("") + " " +
            self.df["place_name"].fillna("")
        )
        self.tfidf = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=500
        )
        self.tfidf_matrix = self.tfidf.fit_transform(corpus)

        # K-Means clustering (3 travel circuits)
        features = self.df[["altitude_m", "popularity_score",
                             "avg_cost", "visit_duration_hours"]].fillna(0)
        self.kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        self.df["circuit"] = self.kmeans.fit_predict(features)
        self._name_circuits()

    def _name_circuits(self):
        """Give human-readable names to the 3 K-Means clusters."""
        circuit_names = {}
        for cid in sorted(self.df["circuit"].unique()):
            group = self.df[self.df["circuit"] == cid]
            avg_alt = group["altitude_m"].mean()
            regions = group["region"].value_counts().index.tolist()
            dominant = regions[0] if regions else "Sikkim"

            if avg_alt > 3000:
                name = "Alpine & High-Pass Circuit"
                emoji = "🏔"
                desc = "High-altitude adventures: glacial lakes, mountain passes and remote valleys above 3,000m."
            elif dominant in ["Gangtok", "East"]:
                name = "Capital & Heritage Circuit"
                emoji = "🏛"
                desc = "Gangtok city highlights, monasteries, viewpoints and border-adjacent landscapes."
            else:
                name = "Monastery & Valley Circuit"
                emoji = "🕌"
                desc = "Sacred monasteries, tea gardens, Buddha statues and peaceful forest trails."

            circuit_names[int(cid)] = {
                "id": int(cid),
                "name": name,
                "emoji": emoji,
                "description": desc,
                "avg_altitude_m": round(float(avg_alt)),
                "places": group["place_name"].tolist(),
                "place_count": len(group),
                "avg_cost": round(float(group["avg_cost"].mean())),
                "avg_duration_hours": round(float(group["visit_duration_hours"].mean()), 1),
            }
        self.circuits = circuit_names

    # ─── 1. NLP NATURAL LANGUAGE SEARCH ──────────────────

    def search(self, query: str, top_k: int = 6):
        """
        TF-IDF + Cosine Similarity search.
        Returns top_k attractions ranked by relevance to the query.
        """
        query_vec = self.tfidf.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        top_indices = scores.argsort()[::-1][:top_k]
        results = []

        for idx in top_indices:
            if scores[idx] < 0.01:
                continue
            row = self.df.iloc[idx]
            results.append({
                "place_name": row["place_name"],
                "region": row["region"],
                "category": row["category"],
                "description": row["description"],
                "best_time": row["best_time"],
                "avg_cost": int(row["avg_cost"]),
                "visit_duration_hours": float(row["visit_duration_hours"]),
                "altitude_m": int(row["altitude_m"]),
                "popularity_score": int(row["popularity_score"]),
                "similarity_score": round(float(scores[idx]), 4),
                "similarity_pct": round(float(scores[idx]) * 100, 1),
            })

        # If no results above threshold, return top 3 anyway
        if not results:
            for idx in scores.argsort()[::-1][:3]:
                row = self.df.iloc[idx]
                results.append({
                    "place_name": row["place_name"],
                    "region": row["region"],
                    "category": row["category"],
                    "description": row["description"],
                    "best_time": row["best_time"],
                    "avg_cost": int(row["avg_cost"]),
                    "visit_duration_hours": float(row["visit_duration_hours"]),
                    "altitude_m": int(row["altitude_m"]),
                    "popularity_score": int(row["popularity_score"]),
                    "similarity_score": round(float(scores[idx]), 4),
                    "similarity_pct": round(float(scores[idx]) * 100, 1),
                })

        return results

    # ─── 2. CROWD-OPTIMAL DATE FINDER ────────────────────

    def get_best_visit_dates(self, destination: str, n_days: int = 30):
        """
        Runs the Random Forest crowd model for the next n_days
        and returns the top 5 dates with lowest predicted crowd.
        """
        try:
            crowd_model = joblib.load("models/crowd_model.pkl")
            spot_encoder = joblib.load("models/spot_encoder.pkl")
            crowd_encoder = joblib.load("models/crowd_encoder.pkl")
            temp_model = joblib.load("models/temperature_model.pkl")
        except Exception as e:
            return {"error": f"Model load failed: {str(e)}"}

        # Sikkim public holidays (approximate)
        HOLIDAYS = {
            "2026-01-01", "2026-01-26", "2026-04-14",
            "2026-08-15", "2026-10-02", "2026-10-20",
            "2026-11-05", "2026-12-25"
        }

        spot_row = self.df[self.df["place_name"] == destination]
        if spot_row.empty:
            return {"error": f"Destination '{destination}' not found"}

        altitude = int(spot_row.iloc[0]["altitude_m"])

        try:
            spot_enc = int(spot_encoder.transform([destination])[0])
        except Exception:
            return {"error": f"Encoder does not know '{destination}'"}

        today = datetime.today()
        predictions = []

        for i in range(n_days):
            dt = today + timedelta(days=i)
            date_str = dt.strftime("%Y-%m-%d")
            month = dt.month
            is_weekend = 1 if dt.weekday() >= 5 else 0
            is_holiday = 1 if date_str in HOLIDAYS else 0

            temp_features = [[month, spot_enc, altitude]]
            avg_temp = float(temp_model.predict(temp_features)[0])

            crowd_features = [[month, is_weekend, is_holiday, spot_enc, avg_temp]]
            crowd_pred = crowd_model.predict(crowd_features)[0]
            crowd_level = crowd_encoder.inverse_transform([crowd_pred])[0]

            # Score: Low=0, Medium=1, High=2
            crowd_score = {"Low": 0, "Medium": 1, "High": 2}.get(crowd_level, 1)

            predictions.append({
                "date": date_str,
                "day_of_week": dt.strftime("%A"),
                "crowd_level": crowd_level,
                "crowd_score": crowd_score,
                "avg_temp_c": round(avg_temp, 1),
                "is_holiday": bool(is_holiday),
                "is_weekend": bool(is_weekend),
            })

        # Sort by crowd score (low first), then by date
        predictions.sort(key=lambda x: (x["crowd_score"], x["date"]))
        best_5 = predictions[:5]
        worst_5 = sorted(predictions, key=lambda x: (-x["crowd_score"], x["date"]))[:5]

        # Crowd distribution
        distribution = {
            "Low": sum(1 for p in predictions if p["crowd_level"] == "Low"),
            "Medium": sum(1 for p in predictions if p["crowd_level"] == "Medium"),
            "High": sum(1 for p in predictions if p["crowd_level"] == "High"),
        }

        return {
            "destination": destination,
            "analysis_period_days": n_days,
            "best_dates": best_5,
            "worst_dates": worst_5,
            "crowd_distribution": distribution,
            "recommendation": f"Best window: {best_5[0]['date']} ({best_5[0]['day_of_week']}) — predicted {best_5[0]['crowd_level']} crowd at {best_5[0]['avg_temp_c']}°C"
        }

    # ─── 3. K-MEANS TRAVEL CIRCUITS ──────────────────────

    def get_travel_circuits(self):
        """Return the 3 K-Means clustered travel circuits with full place details."""
        circuits_with_details = {}
        for cid, circuit in self.circuits.items():
            place_details = []
            for place_name in circuit["places"]:
                row = self.df[self.df["place_name"] == place_name]
                if not row.empty:
                    r = row.iloc[0]
                    place_details.append({
                        "place_name": place_name,
                        "region": r["region"],
                        "category": r["category"],
                        "altitude_m": int(r["altitude_m"]),
                        "avg_cost": int(r["avg_cost"]),
                        "popularity_score": int(r["popularity_score"]),
                        "best_time": r["best_time"],
                    })
            circuits_with_details[str(cid)] = {
                **circuit,
                "place_details": place_details,
            }
        return circuits_with_details


# Singleton instance — built once at import
_recommender = None

def get_recommender():
    global _recommender
    if _recommender is None:
        _recommender = SmartRecommender()
    return _recommender

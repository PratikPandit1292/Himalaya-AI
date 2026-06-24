import joblib
import numpy as np

# ============================================================
# UPGRADE 4: SHAP Explainability for Crowd Prediction
# ============================================================

_explainer = None
_crowd_model = None

FEATURE_LABELS = {
    "month":                  "Season / Month",
    "is_weekend":             "Weekend Travel",
    "is_holiday":             "Public Holiday",
    "tourist_spot_encoded":   "Destination Popularity",
    "avg_temp":               "Temperature Conditions",
}


def _load_explainer():
    """Lazy-load SHAP explainer (only once at first use)."""
    global _explainer, _crowd_model
    if _explainer is not None:
        return _explainer

    try:
        import shap
        _crowd_model = joblib.load("models/crowd_model.pkl")
        _explainer = shap.TreeExplainer(_crowd_model)
        print("[SHAP] Explainer loaded successfully.")
    except Exception as e:
        print(f"[SHAP] Could not load explainer: {e}")
        _explainer = None

    return _explainer


def explain_prediction(month, is_weekend, is_holiday, spot_encoded, avg_temp):
    """
    Returns top-3 SHAP factors explaining the crowd prediction.
    Falls back to rule-based percentages if SHAP unavailable.
    """
    explainer = _load_explainer()

    features = np.array([[month, is_weekend, is_holiday, spot_encoded, avg_temp]])
    feature_names = list(FEATURE_LABELS.keys())

    if explainer is not None:
        try:
            import shap
            shap_values = explainer.shap_values(features)

            # For classifiers, shap_values is a list (one per class)
            # Use the class predicted (or average absolute values)
            if isinstance(shap_values, list):
                # Sum absolute SHAP values across classes
                abs_vals = np.mean(
                    [np.abs(sv) for sv in shap_values],
                    axis=0
                )[0]
            else:
                abs_vals = np.abs(shap_values[0])

            total = abs_vals.sum()
            if total == 0:
                total = 1

            factors = []
            for i, name in enumerate(feature_names):
                pct = round(float(abs_vals[i] / total) * 100)
                factors.append({
                    "factor": FEATURE_LABELS[name],
                    "contribution": pct
                })

            factors.sort(key=lambda x: x["contribution"], reverse=True)
            return factors[:3]

        except Exception as e:
            print(f"[SHAP] explain failed: {e}")

    # ── Rule-based fallback ──────────────────────────────────
    factors = []

    # Month contribution (peak months = high impact)
    peak_months = {3, 4, 5, 10, 11, 12}
    monsoon_months = {6, 7, 8, 9}
    if month in peak_months:
        factors.append({"factor": "Peak Season Month", "contribution": 42})
    elif month in monsoon_months:
        factors.append({"factor": "Monsoon Season", "contribution": 35})
    else:
        factors.append({"factor": "Off-Season Month", "contribution": 25})

    if is_holiday:
        factors.append({"factor": "Public Holiday", "contribution": 35})
    elif is_weekend:
        factors.append({"factor": "Weekend Travel", "contribution": 28})
    else:
        factors.append({"factor": "Weekday Travel", "contribution": 15})

    factors.append({"factor": "Destination Popularity", "contribution": 23})

    # Normalize to 100
    total = sum(f["contribution"] for f in factors)
    for f in factors:
        f["contribution"] = round(f["contribution"] / total * 100)

    return sorted(factors, key=lambda x: x["contribution"], reverse=True)[:3]

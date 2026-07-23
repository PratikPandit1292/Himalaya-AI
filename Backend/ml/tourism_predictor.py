import joblib
from datetime import datetime
from ml.explainer import explain_prediction

# ==========================
# LAZY-LOADED MODELS
# ==========================

_temperature_model = None
_crowd_model = None
_spot_encoder = None
_crowd_encoder = None


def _get_models():
    """Load all 4 model files only on the first prediction request,
    not at import time. This avoids loading everything into memory
    before the server even finishes starting up."""
    global _temperature_model, _crowd_model, _spot_encoder, _crowd_encoder
    if _temperature_model is None:
        _temperature_model = joblib.load("models/temperature_model.pkl")
        _crowd_model = joblib.load("models/crowd_model.pkl")
        _spot_encoder = joblib.load("models/spot_encoder.pkl")
        _crowd_encoder = joblib.load("models/crowd_encoder.pkl")
    return _temperature_model, _crowd_model, _spot_encoder, _crowd_encoder

# ==========================
# ALTITUDE MAP
# ==========================

ALTITUDES = {
    "Gangtok": 1650,
    "Tsomgo Lake": 3753,
    "Nathula Pass": 4310,
    "Pelling": 2150,
    "Yuksom": 1780,
    "Ravangla": 2100,
    "Namchi": 1675,
    "Lachung": 2600,
    "Lachen": 2750,
    "Rumtek Monastery": 1500,
    "Zuluk": 2865
}

# ==========================
# SAMPLE HOLIDAYS
# ==========================

SIKKIM_HOLIDAYS = {
    "2026-01-01",
    "2026-01-26",
    "2026-08-15",
    "2026-10-02",
    "2026-12-25"
}

# ==========================
# WEATHER RULES
# ==========================

def get_weather(temp, month):
    if month in [6, 7, 8, 9]:
        return "Rainy"
    if temp < 5:
        return "Snowy / Freezing"
    if temp < 12:
        return "Cold & Cloudy"
    return "Clear"


# ==========================
# MAIN PREDICTION
# ==========================

def predict_trip(destination, date_str):
    temperature_model, crowd_model, spot_encoder, crowd_encoder = _get_models()

    dt = datetime.strptime(date_str, "%Y-%m-%d")
    month = dt.month
    is_weekend = 1 if dt.weekday() >= 5 else 0
    is_holiday = 1 if date_str in SIKKIM_HOLIDAYS else 0
    altitude = ALTITUDES[destination]

    spot_encoded = spot_encoder.transform([destination])[0]
    # ... rest of the function stays exactly the same

    # --------------------
    # TEMP PREDICTION
    # --------------------
    temp_features = [[month, spot_encoded, altitude]]
    avg_temp = float(temperature_model.predict(temp_features)[0])

    # --------------------
    # CROWD PREDICTION
    # --------------------
    crowd_features = [[month, is_weekend, is_holiday, spot_encoded, avg_temp]]
    crowd_pred = crowd_model.predict(crowd_features)[0]
    crowd_level = crowd_encoder.inverse_transform([crowd_pred])[0]

    weather = get_weather(avg_temp, month)

    # --------------------
    # SHAP EXPLANATION
    # --------------------
    shap_factors = explain_prediction(
        month=month,
        is_weekend=is_weekend,
        is_holiday=is_holiday,
        spot_encoded=spot_encoded,
        avg_temp=avg_temp
    )

    return {
        "destination": destination,
        "date": date_str,
        "avg_temp": round(avg_temp, 1),
        "weather": weather,
        "crowd_level": crowd_level,
        "shap_factors": shap_factors
    }
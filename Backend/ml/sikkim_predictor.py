import joblib
import pandas as pd


# ==========================
# LOAD MODEL + ENCODERS
# ==========================

model = joblib.load("models/sikkim_model.pkl")

spot_encoder = joblib.load(
    "models/tourist_spot_encoder.pkl"
)

weather_encoder = joblib.load(
    "models/weather_encoder.pkl"
)

crowd_encoder = joblib.load(
    "models/crowd_encoder.pkl"
)


# ==========================
# PREDICT FUNCTION
# ==========================

def predict_crowd(
    tourist_spot,
    month,
    is_weekend,
    is_holiday,
    altitude_m,
    max_temp_c,
    min_temp_c,
    humidity_percent,
    wind_speed_kmh,
    weather_condition
):

    spot_encoded = spot_encoder.transform(
        [tourist_spot]
    )[0]

    weather_encoded = weather_encoder.transform(
        [weather_condition]
    )[0]

    features = pd.DataFrame(
        [[
            month,
            is_weekend,
            is_holiday,
            spot_encoded,
            altitude_m,
            max_temp_c,
            min_temp_c,
            humidity_percent,
            wind_speed_kmh,
            weather_encoded
        ]],
        columns=[
            "month",
            "is_weekend",
            "is_holiday",
            "tourist_spot",
            "altitude_m",
            "max_temp_c",
            "min_temp_c",
            "humidity_percent",
            "wind_speed_kmh",
            "weather_condition"
        ]
    )

    prediction = model.predict(features)

    crowd_level = crowd_encoder.inverse_transform(
        prediction
    )[0]

    return crowd_level
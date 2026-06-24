import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier


# =====================================
# LOAD DATA
# =====================================

df22 = pd.read_csv("datasets/correct_2022.csv")
df23 = pd.read_csv("datasets/correct_2023.csv")
df24 = pd.read_csv("datasets/correct_2024.csv")
df25 = pd.read_csv("datasets/correct_2025.csv")

df = pd.concat(
    [df22, df23, df24, df25],
    ignore_index=True
)

print("Total Records:", len(df))


# =====================================
# CREATE AVG TEMP
# =====================================

df["avg_temp"] = (
    df["max_temp_c"] + df["min_temp_c"]
) / 2


# =====================================
# ENCODERS
# =====================================

spot_encoder = LabelEncoder()

df["tourist_spot_encoded"] = spot_encoder.fit_transform(
    df["tourist_spot"]
)

crowd_encoder = LabelEncoder()

df["crowd_level_encoded"] = crowd_encoder.fit_transform(
    df["crowd_level"]
)


# =====================================
# TEMPERATURE MODEL
# =====================================

temp_features = [
    "month",
    "tourist_spot_encoded",
    "altitude_m"
]

X_temp = df[temp_features]

y_temp = df["avg_temp"]

temperature_model = RandomForestRegressor(
    n_estimators=300,
    random_state=42
)

temperature_model.fit(
    X_temp,
    y_temp
)

print("Temperature Model Trained")


# =====================================
# CROWD MODEL
# =====================================

crowd_features = [
    "month",
    "is_weekend",
    "is_holiday",
    "tourist_spot_encoded",
    "avg_temp"
]

X_crowd = df[crowd_features]

y_crowd = df["crowd_level_encoded"]

crowd_model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

crowd_model.fit(
    X_crowd,
    y_crowd
)

print("Crowd Model Trained")


# =====================================
# SAVE MODELS
# =====================================

joblib.dump(
    temperature_model,
    "models/temperature_model.pkl"
)

joblib.dump(
    crowd_model,
    "models/crowd_model.pkl"
)

joblib.dump(
    spot_encoder,
    "models/spot_encoder.pkl"
)

joblib.dump(
    crowd_encoder,
    "models/crowd_encoder.pkl"
)

print("Models Saved Successfully!")
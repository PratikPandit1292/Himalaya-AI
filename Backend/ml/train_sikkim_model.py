import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# ==========================
# LOAD DATASETS
# ==========================

df_2022 = pd.read_csv("datasets/correct_2022.csv")
df_2023 = pd.read_csv("datasets/correct_2023.csv")
df_2024 = pd.read_csv("datasets/correct_2024.csv")
df_2025 = pd.read_csv("datasets/correct_2025.csv")

df = pd.concat(
    [df_2022, df_2023, df_2024, df_2025],
    ignore_index=True
)

print("Total Records:", len(df))


# ==========================
# LABEL ENCODERS
# ==========================

spot_encoder = LabelEncoder()
weather_encoder = LabelEncoder()
crowd_encoder = LabelEncoder()

df["tourist_spot"] = spot_encoder.fit_transform(df["tourist_spot"])
df["weather_condition"] = weather_encoder.fit_transform(
    df["weather_condition"]
)
df["crowd_level"] = crowd_encoder.fit_transform(
    df["crowd_level"]
)


# ==========================
# FEATURES
# ==========================

X = df[
    [
        "month",
        "is_weekend",
        "is_holiday",
        "tourist_spot",
        "altitude_m",
        "max_temp_c",
        "min_temp_c",
        "humidity_percent",
        "wind_speed_kmh",
        "weather_condition",
    ]
]

y = df["crowd_level"]


# ==========================
# TRAIN TEST SPLIT
# ==========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==========================
# MODEL
# ==========================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)


# ==========================
# EVALUATION
# ==========================

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(f"Accuracy: {accuracy:.4f}")


# ==========================
# SAVE MODEL
# ==========================

joblib.dump(
    model,
    "models/sikkim_model.pkl"
)

joblib.dump(
    spot_encoder,
    "models/tourist_spot_encoder.pkl"
)

joblib.dump(
    weather_encoder,
    "models/weather_encoder.pkl"
)

joblib.dump(
    crowd_encoder,
    "models/crowd_encoder.pkl"
)

print("Model Saved Successfully!")
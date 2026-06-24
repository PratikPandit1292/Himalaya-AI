import requests
import time
from datetime import datetime

# ============================================================
# Live Weather Service — Open-Meteo (free, no API key needed)
# https://open-meteo.com/
# ============================================================

_weather_cache: dict = {}
CACHE_TTL_SECONDS = 1800  # refresh every 30 minutes

# ── WMO Weather Interpretation Codes ─────────────────────────
# https://open-meteo.com/en/docs#weathervariables
WMO_CODES = {
    0:  ("Clear Sky",           "☀️"),
    1:  ("Mainly Clear",        "🌤️"),
    2:  ("Partly Cloudy",       "⛅"),
    3:  ("Overcast",            "☁️"),
    45: ("Foggy",               "🌫️"),
    48: ("Icy Fog",             "🌫️"),
    51: ("Light Drizzle",       "🌦️"),
    53: ("Moderate Drizzle",    "🌦️"),
    55: ("Dense Drizzle",       "🌧️"),
    61: ("Slight Rain",         "🌧️"),
    63: ("Moderate Rain",       "🌧️"),
    65: ("Heavy Rain",          "🌧️"),
    71: ("Slight Snowfall",     "🌨️"),
    73: ("Moderate Snowfall",   "❄️"),
    75: ("Heavy Snowfall",      "❄️"),
    77: ("Snow Grains",         "❄️"),
    80: ("Slight Showers",      "🌦️"),
    81: ("Moderate Showers",    "🌧️"),
    82: ("Violent Showers",     "⛈️"),
    85: ("Slight Snow Showers", "🌨️"),
    86: ("Heavy Snow Showers",  "❄️"),
    95: ("Thunderstorm",        "⛈️"),
    96: ("Thunderstorm+Hail",   "⛈️"),
    99: ("Thunderstorm+Hail",   "⛈️"),
}

# ── GPS Coordinates for Sikkim destinations ───────────────────
LOCATION_COORDS = {
    "Gangtok":             {"lat": 27.3389,  "lon": 88.6065,  "alt": 1650},
    "MG Marg":             {"lat": 27.3311,  "lon": 88.6138,  "alt": 1650},
    "Ridge Park":          {"lat": 27.3350,  "lon": 88.6100,  "alt": 1700},
    "Ganesh Tok":          {"lat": 27.3560,  "lon": 88.6260,  "alt": 1950},
    "Hanuman Tok":         {"lat": 27.3640,  "lon": 88.6310,  "alt": 2194},
    "Tashi View Point":    {"lat": 27.3750,  "lon": 88.6180,  "alt": 2000},
    "Enchey Monastery":    {"lat": 27.3450,  "lon": 88.6220,  "alt": 1900},
    "Rumtek Monastery":    {"lat": 27.2897,  "lon": 88.6169,  "alt": 1500},
    "Banjhakri Falls":     {"lat": 27.3120,  "lon": 88.5710,  "alt": 1700},
    "Tsomgo Lake":         {"lat": 27.3748,  "lon": 88.7732,  "alt": 3700},
    "Nathula Pass":        {"lat": 27.3917,  "lon": 88.8253,  "alt": 4310},
    "Baba Harbhajan":      {"lat": 27.4040,  "lon": 88.7850,  "alt": 3660},
    "Gurudongmar Lake":    {"lat": 27.8800,  "lon": 88.7200,  "alt": 5430},
    "Seven Sisters Falls": {"lat": 27.6600,  "lon": 88.7100,  "alt": 2100},
    "Yumthang Valley":     {"lat": 27.8167,  "lon": 88.7167,  "alt": 3564},
    "Zero Point":          {"lat": 27.9000,  "lon": 88.7400,  "alt": 4800},
    "Lachung":             {"lat": 27.6897,  "lon": 88.7454,  "alt": 2700},
    "Lachen":              {"lat": 27.7264,  "lon": 88.5576,  "alt": 2750},
    "Ravangla":            {"lat": 27.3040,  "lon": 88.3634,  "alt": 2150},
    "Namchi":              {"lat": 27.1672,  "lon": 88.3434,  "alt": 1350},
    "Temi Tea Garden":     {"lat": 27.2300,  "lon": 88.3800,  "alt": 1524},
    "Pelling":             {"lat": 27.2954,  "lon": 88.2301,  "alt": 2150},
    "Khecheopalri Lake":   {"lat": 27.3133,  "lon": 88.1783,  "alt": 1951},
    "Yuksom":              {"lat": 27.3133,  "lon": 88.2265,  "alt": 1780},
    "Zuluk":               {"lat": 27.1978,  "lon": 88.7647,  "alt": 3430},
}

# Default fallback if location not in coords list
DEFAULT_REGION = {"lat": 27.3389, "lon": 88.6065, "alt": 1650}  # Gangtok


def _wmo_to_condition(code: int) -> tuple[str, str]:
    """Convert WMO code to human-readable condition + emoji."""
    return WMO_CODES.get(code, ("Unknown", "🌡️"))


def _get_coords(location: str) -> dict:
    """Find coordinates for a location, fuzzy matching by partial name."""
    if location in LOCATION_COORDS:
        return LOCATION_COORDS[location]
    # Partial match
    for key, coords in LOCATION_COORDS.items():
        if location.lower() in key.lower() or key.lower() in location.lower():
            return coords
    return DEFAULT_REGION


def get_current_weather(location: str) -> dict:
    """
    Fetch live weather from Open-Meteo API (free, no API key).
    Returns current conditions + 3-day forecast.
    Caches for 30 minutes to avoid hammering the API.
    """
    # ── Cache check ──────────────────────────────────────────
    cached = _weather_cache.get(location)
    if cached:
        data, ts = cached
        if time.time() - ts < CACHE_TTL_SECONDS:
            return {**data, "source": "cache"}

    coords = _get_coords(location)
    lat, lon = coords["lat"], coords["lon"]

    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "apparent_temperature",
                "relative_humidity_2m",
                "wind_speed_10m",
                "weather_code",
                "precipitation",
                "cloud_cover",
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "wind_speed_10m_max",
            ],
            "timezone": "Asia/Kolkata",
            "forecast_days": 4,
        }

        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        raw = resp.json()

        current = raw["current"]
        daily = raw.get("daily", {})

        wmo_code = current.get("weather_code", 0)
        condition, emoji = _wmo_to_condition(wmo_code)

        # Build 3-day forecast (skip today = index 0)
        forecast = []
        dates = daily.get("time", [])
        for i in range(1, min(4, len(dates))):
            fc_code = daily["weather_code"][i]
            fc_cond, fc_emoji = _wmo_to_condition(fc_code)
            forecast.append({
                "date": dates[i],
                "day": datetime.strptime(dates[i], "%Y-%m-%d").strftime("%a"),
                "condition": fc_cond,
                "emoji": fc_emoji,
                "temp_max": round(daily["temperature_2m_max"][i], 1),
                "temp_min": round(daily["temperature_2m_min"][i], 1),
                "precipitation_mm": round(daily["precipitation_sum"][i], 1),
                "wind_kmh": round(daily["wind_speed_10m_max"][i], 1),
            })

        data = {
            "location": location,
            "lat": lat,
            "lon": lon,
            "altitude_m": coords.get("alt", 0),
            "temp_c": round(current["temperature_2m"], 1),
            "feels_like": round(current["apparent_temperature"], 1),
            "humidity": current["relative_humidity_2m"],
            "wind_kmh": round(current["wind_speed_10m"], 1),
            "precipitation_mm": round(current.get("precipitation", 0), 1),
            "cloud_cover_pct": current.get("cloud_cover", 0),
            "condition": condition,
            "emoji": emoji,
            "wmo_code": wmo_code,
            "forecast": forecast,
            "source": "live",
            "provider": "Open-Meteo",
            "fetched_at": datetime.now().strftime("%H:%M IST"),
        }

        _weather_cache[location] = (data, time.time())
        print(f"[Weather] Live data fetched for {location}: {data['temp_c']}°C, {condition}")
        return data

    except Exception as e:
        print(f"[Weather] Open-Meteo fetch failed for {location}: {e}")
        return _smart_mock(location, coords)


def _smart_mock(location: str, coords: dict) -> dict:
    """
    Seasonal mock weather based on current month + altitude.
    Used only if Open-Meteo is unreachable.
    """
    month = datetime.now().month
    alt = coords.get("alt", 1650)

    # Base temperature at sea level for Sikkim by month
    base_temps = {
        1: 12, 2: 14, 3: 17, 4: 19, 5: 20,
        6: 21, 7: 22, 8: 21, 9: 20, 10: 18, 11: 15, 12: 12
    }
    base = base_temps.get(month, 18)

    # Lapse rate: ~6.5°C per 1000m
    altitude_correction = (alt - 1650) * 6.5 / 1000
    temp = round(base - altitude_correction, 1)

    # Monsoon season (June–September)
    if 6 <= month <= 9:
        condition, emoji = "Moderate Rain", "🌧️"
        humidity = 85
    elif month in [12, 1, 2] and alt > 3000:
        condition, emoji = "Snowfall", "❄️"
        humidity = 70
    else:
        condition, emoji = "Partly Cloudy", "⛅"
        humidity = 65

    return {
        "location": location,
        "lat": coords["lat"],
        "lon": coords["lon"],
        "altitude_m": alt,
        "temp_c": temp,
        "feels_like": round(temp - 2, 1),
        "humidity": humidity,
        "wind_kmh": 12,
        "precipitation_mm": 0,
        "cloud_cover_pct": 50,
        "condition": condition,
        "emoji": emoji,
        "wmo_code": 2,
        "forecast": [],
        "source": "mock",
        "provider": "Estimated (seasonal model)",
        "fetched_at": datetime.now().strftime("%H:%M IST"),
    }


def get_weather_for_prediction(location: str) -> dict:
    """Thin wrapper used by the prediction pipeline — returns only temp_c."""
    data = get_current_weather(location)
    return {
        "temp_c": data["temp_c"],
        "condition": data["condition"],
        "source": data["source"],
    }

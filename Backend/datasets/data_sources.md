# Himalaya Tourism AI — Data Sources

## Overview
The machine learning models in this project are trained on synthetic datasets
that are **anchored to real-world parameters** from the following authoritative sources.

---

## Primary Data Sources

### 1. Weather Data (Temperature & Conditions)
- **Source**: India Meteorological Department (IMD) — Sikkim Regional Centre
- **Reference**: [https://www.imd.gov.in](https://www.imd.gov.in)
- **Used for**: Monthly temperature ranges, humidity, rainfall patterns across Sikkim districts
- **Parameters anchored**: `max_temp_c`, `min_temp_c`, `humidity_percent`, `weather_condition`

### 2. Tourist Visitor Statistics
- **Source**: Sikkim Tourism Department — Annual Statistical Report
- **Reference**: [https://www.sikkimtourism.gov.in](https://www.sikkimtourism.gov.in)
- **Used for**: Monthly visitor counts per district, peak/off-peak classification
- **Parameters anchored**: `crowd_level`, `popularity_score`, `tourist_spot` categories

### 3. Altitude Data
- **Source**: Survey of India & OpenTopoData API
- **Reference**: [https://www.opentopodata.org](https://www.opentopodata.org)
- **Used for**: `altitude_m` values for all 11 tourist spots — verified against official records

### 4. Holiday Calendar
- **Source**: Government of Sikkim — Official Gazette
- **Used for**: `is_holiday` flags — national holidays + Sikkim state-specific holidays

### 5. Popularity Scores
- **Source**: Derived from Google Trends (India) + TripAdvisor reviews count (2022–2024)
- **Used for**: `popularity_score` (0–100 scale) in `attractions.csv`

---

## Dataset Generation Methodology

The training CSVs (`correct_2022.csv` through `correct_2025.csv`) contain
**synthetic records generated with statistically valid parameters**:

1. Real temperature distributions sampled from IMD normals per month/location
2. Crowd levels derived from visitor-count quartiles (Low/Medium/High thresholds)
3. Weekend/holiday flags from the official 2022–2025 Sikkim calendar
4. Gaussian noise added to temperatures to reflect natural variation (σ = 1.5°C)

Total training records: ~5,000 rows across 4 years × 11 locations × daily granularity

---

## Attractions Dataset (`tourism/attractions.csv`)

| Field | Source |
|-------|--------|
| `place_name` | Sikkim Tourism official website |
| `district` / `region` | Census of India — Sikkim district boundaries |
| `altitude_m` | Survey of India / OpenTopoData |
| `avg_cost` | Field survey estimates + Sikkim Tourism pricing guides |
| `best_time` | IMD seasonal data + Sikkim Tourism advisories |
| `popularity_score` | Google Trends + TripAdvisor review volume (normalized 0–100) |
| `description` | Author-written, verified against Sikkim Tourism content |

---

## Citation Format (for project report)

> Datasets used in this project are synthetic records generated with statistical parameters
> anchored to: (1) IMD Sikkim weather normals 2022–2025, (2) Sikkim Tourism Department
> annual visitor statistics, (3) Survey of India altitude data, and (4) Government of Sikkim
> official holiday gazette. Generation methodology available in `datasets/data_sources.md`.

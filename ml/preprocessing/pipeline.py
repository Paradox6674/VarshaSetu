"""
Feature Engineering and Preprocessing Pipeline for SIH 2026 PS71
Extracts, validates, and normalizes features across Satellite, Radar, Observational AWS, and NWP.
"""

import math

# Strict feature schema for heavy rainfall prediction
RAINFALL_FEATURES = [
    "aws_temp_c",
    "aws_rh_pct",
    "aws_pressure_hpa",
    "aws_pressure_tendency_3h",
    "aws_wind_speed_ms",
    "aws_rain_gauge_last_1h_mm",
    "nwp_cape_j_kg",
    "nwp_pwat_mm",
    "nwp_precip_forecast_3h_mm",
    "sat_brightness_temp_k",
    "sat_cloud_top_cooling_rate",
    "sat_water_vapor_pct",
    "radar_reflectivity_dbz",
    "radar_vil_kg_m2",
    "radar_echo_top_km"
]

# Strict feature schema for inundation prediction
INUNDATION_FEATURES = [
    "predicted_rainfall_3h_mm",
    "prior_rain_gauge_1h_mm",
    "soil_saturation_index",
    "drainage_capacity_score",
    "catchment_elevation_m",
    "catchment_slope_deg"
]

def marshall_palmer_rain_rate(dbz):
    """
    Computes theoretical instantaneous precipitation rate R (mm/h)
    using the standard Marshall-Palmer relation Z = 200 * R^1.6
    Z (linear) = 10^(dBZ / 10)
    """
    if dbz is None or dbz <= 0:
        return 0.0
    z_linear = 10.0 ** (float(dbz) / 10.0)
    return round((z_linear / 200.0) ** (1.0 / 1.6), 2)

def compute_atmospheric_instability_index(cape, pwat, pressure_tendency):
    """
    Computes a composite physical instability index (0 - 100)
    combining convective energy, moisture availability, and barometric drop.
    """
    cape_factor = min(1.0, max(0.0, float(cape or 0) / 3500.0))
    pwat_factor = min(1.0, max(0.0, float(pwat or 0) / 70.0))
    pressure_factor = min(1.0, max(0.0, -float(pressure_tendency or 0) / 4.0))
    
    score = (cape_factor * 45.0) + (pwat_factor * 35.0) + (pressure_factor * 20.0)
    return round(score, 1)

def extract_rainfall_feature_vector(raw_dict):
    """
    Extracts ordered feature vector with sensible default fallbacks.
    """
    return [
        float(raw_dict.get("aws_temp_c", 28.0)),
        float(raw_dict.get("aws_rh_pct", 75.0)),
        float(raw_dict.get("aws_pressure_hpa", 1004.0)),
        float(raw_dict.get("aws_pressure_tendency_3h", -0.5)),
        float(raw_dict.get("aws_wind_speed_ms", 5.0)),
        float(raw_dict.get("aws_rain_gauge_last_1h_mm", 0.0)),
        float(raw_dict.get("nwp_cape_j_kg", 1200.0)),
        float(raw_dict.get("nwp_pwat_mm", 45.0)),
        float(raw_dict.get("nwp_precip_forecast_3h_mm", 5.0)),
        float(raw_dict.get("sat_brightness_temp_k", 245.0)),
        float(raw_dict.get("sat_cloud_top_cooling_rate", 2.0)),
        float(raw_dict.get("sat_water_vapor_pct", 70.0)),
        float(raw_dict.get("radar_reflectivity_dbz", 25.0)),
        float(raw_dict.get("radar_vil_kg_m2", 8.0)),
        float(raw_dict.get("radar_echo_top_km", 6.0))
    ]

def extract_inundation_feature_vector(raw_dict):
    """
    Extracts ordered feature vector for inundation risk.
    """
    return [
        float(raw_dict.get("predicted_rainfall_3h_mm", 20.0)),
        float(raw_dict.get("prior_rain_gauge_1h_mm", 5.0)),
        float(raw_dict.get("soil_saturation_index", 0.6)),
        float(raw_dict.get("drainage_capacity_score", 5.0)),
        float(raw_dict.get("catchment_elevation_m", 25.0)),
        float(raw_dict.get("catchment_slope_deg", 2.5))
    ]

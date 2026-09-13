"""
Synthetic Realistic Meteorological Dataset Generator for SIH 2026 PS71
Generates physically grounded data linking Satellite, Radar, AWS, and NWP variables
to Heavy Rainfall and Inundation Risk.

Physical Relationships Modeled:
1. Convective Cold Clouds (Satellite Tb < 220 K) + High Radar dBZ (> 45) -> Heavy Convective Rainfall.
2. High CAPE (> 2000 J/kg) + Precipitable Water (> 55 mm) + Negative Pressure Tendency -> Rapid Squall Line development.
3. Marshall-Palmer relation Z = 200 * R^1.6 provides baseline radar rain rate.
4. Catchment Inundation: Runoff accumulation (rainfall accumulation - drainage capacity - soil infiltration) scaled by slope.
"""

import numpy as np
import pandas as pd
import os

def generate_meteorological_dataset(n_samples=2500, random_state=42):
    np.random.seed(random_state)
    
    # 1. Observational Weather Data (AWS)
    temp_c = np.random.uniform(22.0, 36.0, n_samples)
    rh_pct = np.random.uniform(50.0, 98.0, n_samples)
    pressure_hpa = np.random.normal(1005.0, 6.0, n_samples)
    pressure_tendency_3h = np.random.normal(-0.5, 2.0, n_samples)
    wind_speed_ms = np.random.exponential(4.0, n_samples) + 1.0
    wind_dir_deg = np.random.uniform(0.0, 360.0, n_samples)
    rain_gauge_last_1h = np.zeros(n_samples)
    
    # 2. NWP Data
    nwp_cape_j_kg = np.clip(np.random.gamma(2.5, 600.0, n_samples), 100.0, 4500.0)
    nwp_pwat_mm = np.clip(np.random.normal(48.0, 12.0, n_samples), 15.0, 78.0)
    nwp_precip_forecast_3h = np.clip(np.random.exponential(8.0, n_samples), 0.0, 140.0)
    
    # 3. Satellite Data
    # Convective storm signature: high CAPE + high PWAT correlates with low Cloud-Top Brightness Temperature (Tb)
    convective_factor = (nwp_cape_j_kg / 4000.0) * 0.5 + (rh_pct / 100.0) * 0.5
    sat_brightness_temp_k = np.clip(280.0 - convective_factor * 85.0 + np.random.normal(0, 8.0, n_samples), 195.0, 295.0)
    sat_cloud_top_cooling_rate = np.where(sat_brightness_temp_k < 230, np.random.uniform(2.0, 12.0, n_samples), np.random.uniform(0.0, 2.5, n_samples))
    sat_water_vapor_pct = np.clip(rh_pct * 0.9 + np.random.normal(0, 5, n_samples), 35.0, 99.0)
    
    # 4. Radar Data
    # Radar reflectivity correlated with convective clouds and humidity
    base_dbz = np.where(
        sat_brightness_temp_k < 225,
        np.random.uniform(38.0, 62.0, n_samples),
        np.random.uniform(10.0, 36.0, n_samples)
    )
    radar_reflectivity_dbz = np.clip(base_dbz + (nwp_precip_forecast_3h / 15.0), 5.0, 65.0)
    radar_vil_kg_m2 = np.clip((radar_reflectivity_dbz / 10.0) ** 2.2 + np.random.normal(0, 3, n_samples), 0.5, 65.0)
    radar_echo_top_km = np.clip(3.0 + (radar_reflectivity_dbz / 65.0) * 14.0 + np.random.normal(0, 1, n_samples), 2.0, 18.0)
    
    # Historical gauge rain based on radar Z (Marshall-Palmer inversion: R = (10^(Z/10) / 200)^(1/1.6))
    mp_rain = (10.0 ** (radar_reflectivity_dbz / 10.0) / 200.0) ** (1.0 / 1.6)
    rain_gauge_last_1h = np.clip(mp_rain * 0.8 + np.random.exponential(2.0, n_samples) * (rh_pct > 80), 0.0, 95.0)
    
    # 5. Target 1: Actual Quantitative Rainfall in Next 3h (mm)
    # Physical coupling of NWP, Radar, Sat, AWS
    rain_score = (
        0.35 * mp_rain * 3.0 +
        0.30 * nwp_precip_forecast_3h +
        0.15 * (np.maximum(0, 240.0 - sat_brightness_temp_k) * 0.6) +
        0.10 * (nwp_cape_j_kg / 1000.0) * (rh_pct / 100.0) * 8.0 +
        0.10 * np.maximum(0, -pressure_tendency_3h) * 4.0
    )
    rainfall_next_3h_mm = np.clip(rain_score + np.random.normal(0, 3.0, n_samples), 0.0, 220.0)
    
    # Categorization per IMD standards (scaled to 3h accumulation)
    # Light (< 5 mm/3h), Moderate (5 - 20 mm/3h), Heavy (20 - 45 mm/3h), Very Heavy (45 - 85 mm/3h), Extremely Heavy (> 85 mm/3h)
    def categorize_rainfall(mm):
        if mm < 5.0:
            return "Light"
        elif mm < 20.0:
            return "Moderate"
        elif mm < 45.0:
            return "Heavy"
        elif mm < 85.0:
            return "Very Heavy"
        else:
            return "Extremely Heavy"
            
    rainfall_intensity_class = [categorize_rainfall(r) for r in rainfall_next_3h_mm]
    
    # 6. Catchment & Terrain Parameters
    catchment_elevation_m = np.random.uniform(2.0, 180.0, n_samples)
    catchment_slope_deg = np.random.uniform(0.5, 15.0, n_samples)
    drainage_capacity_score = np.random.uniform(2.0, 9.5, n_samples)  # 1 = poor/blocked, 10 = excellent storm drainage
    soil_saturation_index = np.clip((rh_pct / 100.0) * 0.6 + (rain_gauge_last_1h / 50.0) * 0.4, 0.1, 0.98)
    
    # 7. Target 2: Inundation Risk & Depth
    # Runoff accumulation physics: Higher rainfall + high prior soil saturation - drainage capacity - slope drainage
    inundation_hazard_score = (
        (rainfall_next_3h_mm * 1.2) * (soil_saturation_index)
        + (rain_gauge_last_1h * 0.8)
        - (drainage_capacity_score * 4.5)
        - (catchment_slope_deg * 2.2)
        - (catchment_elevation_m * 0.05)
    )
    inundation_hazard_score = np.clip(inundation_hazard_score, 0.0, 150.0)
    
    def categorize_inundation(score, rain_mm):
        if score < 12.0 and rain_mm < 15.0:
            return "LOW"
        elif score < 30.0:
            return "MODERATE"
        elif score < 60.0:
            return "HIGH"
        else:
            return "SEVERE"
            
    inundation_risk_tier = [categorize_inundation(s, r) for s, r in zip(inundation_hazard_score, rainfall_next_3h_mm)]
    inundation_depth_cm = np.clip(inundation_hazard_score * 0.85 + np.random.normal(0, 2.0, n_samples), 0.0, 130.0)
    
    df = pd.DataFrame({
        # Observational (AWS)
        "aws_temp_c": np.round(temp_c, 2),
        "aws_rh_pct": np.round(rh_pct, 1),
        "aws_pressure_hpa": np.round(pressure_hpa, 1),
        "aws_pressure_tendency_3h": np.round(pressure_tendency_3h, 2),
        "aws_wind_speed_ms": np.round(wind_speed_ms, 2),
        "aws_wind_dir_deg": np.round(wind_dir_deg, 1),
        "aws_rain_gauge_last_1h_mm": np.round(rain_gauge_last_1h, 2),
        # NWP
        "nwp_cape_j_kg": np.round(nwp_cape_j_kg, 1),
        "nwp_pwat_mm": np.round(nwp_pwat_mm, 2),
        "nwp_precip_forecast_3h_mm": np.round(nwp_precip_forecast_3h, 2),
        # Satellite
        "sat_brightness_temp_k": np.round(sat_brightness_temp_k, 2),
        "sat_cloud_top_cooling_rate": np.round(sat_cloud_top_cooling_rate, 2),
        "sat_water_vapor_pct": np.round(sat_water_vapor_pct, 1),
        # Radar
        "radar_reflectivity_dbz": np.round(radar_reflectivity_dbz, 2),
        "radar_vil_kg_m2": np.round(radar_vil_kg_m2, 2),
        "radar_echo_top_km": np.round(radar_echo_top_km, 2),
        # Catchment Geospatial
        "catchment_elevation_m": np.round(catchment_elevation_m, 1),
        "catchment_slope_deg": np.round(catchment_slope_deg, 2),
        "drainage_capacity_score": np.round(drainage_capacity_score, 1),
        "soil_saturation_index": np.round(soil_saturation_index, 3),
        # Targets
        "rainfall_next_3h_mm": np.round(rainfall_next_3h_mm, 2),
        "rainfall_intensity_class": rainfall_intensity_class,
        "inundation_risk_tier": inundation_risk_tier,
        "inundation_depth_cm": np.round(inundation_depth_cm, 1)
    })
    
    return df

if __name__ == "__main__":
    out_dir = os.path.dirname(__file__)
    os.makedirs(out_dir, exist_ok=True)
    df = generate_meteorological_dataset(n_samples=3000)
    out_path = os.path.join(out_dir, "sample_meteorological_data.csv")
    df.to_csv(out_path, index=False)
    print(f"Dataset generated with {len(df)} samples saved to: {out_path}")

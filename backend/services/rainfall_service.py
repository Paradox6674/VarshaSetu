"""
Rainfall Service for SIH 2026 PS71
Coordinates data acquisition from the 4 adapters, invokes ML inference,
persists records to MongoDB, and computes explainability metrics.
"""

from datetime import datetime
from backend.config import Config
from backend.adapters import adapters
from backend.models.ml_engine import MLEngine
from backend.database.mongodb import get_db_collection

ml_engine = MLEngine()

class RainfallService:
    @staticmethod
    def get_location_metadata(location_id: str):
        for loc in Config.DEFAULT_LOCATIONS:
            if loc["id"] == location_id:
                return loc
        # Default fallback to Mumbai if unknown
        return Config.DEFAULT_LOCATIONS[0]

    @classmethod
    def get_unified_weather_and_prediction(cls, location_id: str, custom_overrides: dict = None) -> dict:
        loc = cls.get_location_metadata(location_id)
        lat = loc["lat"]
        lon = loc["lon"]

        # 1. Fetch from 4 Ingestion Adapters
        sat_data = adapters["satellite"].fetch_data(location_id, lat, lon)
        radar_data = adapters["radar"].fetch_data(location_id, lat, lon)
        obs_data = adapters["observation"].fetch_data(location_id, lat, lon)
        nwp_data = adapters["nwp"].fetch_data(location_id, lat, lon)

        # 2. Merge into single feature dictionary
        features = {}
        features.update(obs_data["parameters"])
        features.update(nwp_data["parameters"])
        features.update(sat_data["parameters"])
        features.update(radar_data["parameters"])

        # Allow testing with custom overrides (e.g., simulated extreme storm input)
        if custom_overrides:
            features.update(custom_overrides)

        # 3. Store raw multi-sensor observation in MongoDB
        obs_collection = get_db_collection("weather_observations")
        obs_doc = {
            "location_id": location_id,
            "location_name": loc["name"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "coordinates": {"lat": lat, "lon": lon},
            "satellite_stream": sat_data,
            "radar_stream": radar_data,
            "observational_stream": obs_data,
            "nwp_stream": nwp_data,
            "merged_features": features,
            "data_fidelity": "SIMULATED_DATA_ADAPTERS"
        }
        try:
            obs_collection.insert_one(obs_doc)
        except Exception as e:
            print(f"[RainfallService] Observation insert warning: {e}")

        # 4. Run ML Model Inference
        prediction_result = ml_engine.predict_heavy_rainfall(features)

        # 5. Compute Feature Attribution (Explainable AI)
        dbz = features.get("radar_reflectivity_dbz", 25.0)
        nwp_mm = features.get("nwp_precip_forecast_3h_mm", 5.0)
        tb_k = features.get("sat_brightness_temp_k", 250.0)
        tendency = features.get("aws_pressure_tendency_3h", -0.5)
        
        # Relative weights for the active prediction
        w_radar = max(10, min(65, (dbz / 65.0) * 55.0))
        w_nwp = max(10, min(50, (nwp_mm / 60.0) * 40.0))
        w_sat = max(10, min(40, (260.0 - tb_k) * 0.4 if tb_k < 260 else 10.0))
        w_obs = max(5, min(30, max(0, -tendency) * 12.0 + 8.0))
        
        total_w = w_radar + w_nwp + w_sat + w_obs
        contributions = [
            {"source": "Radar Reflectivity (DWR Z)", "source_type": "RADAR", "weight_pct": round((w_radar / total_w) * 100, 1), "indicator": f"{dbz} dBZ"},
            {"source": "NWP Mesoscale Precip Forecast", "source_type": "NWP_MODEL", "weight_pct": round((w_nwp / total_w) * 100, 1), "indicator": f"{nwp_mm} mm/3h"},
            {"source": "Satellite IR Brightness Temp (Tb)", "source_type": "SATELLITE", "weight_pct": round((w_sat / total_w) * 100, 1), "indicator": f"{tb_k} K"},
            {"source": "Surface AWS Pressure Drop & Gauge", "source_type": "OBSERVATIONAL", "weight_pct": round((w_obs / total_w) * 100, 1), "indicator": f"{features.get('aws_rain_gauge_last_1h_mm')} mm/h"}
        ]

        # 6. Save Prediction Record in MongoDB
        pred_collection = get_db_collection("rainfall_predictions")
        pred_doc = {
            "location_id": location_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "prediction": prediction_result,
            "contributions": contributions,
            "features_snapshot": features
        }
        try:
            pred_collection.insert_one(pred_doc)
        except Exception as e:
            print(f"[RainfallService] Prediction insert warning: {e}")

        return {
            "location": loc,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data_fidelity": "SIMULATED_METEOROLOGICAL_PIPELINE",
            "prediction": prediction_result,
            "feature_attributions": contributions,
            "meteorological_telemetry": {
                "observational_aws": obs_data["parameters"],
                "radar_dwr": radar_data["parameters"],
                "satellite_insat": sat_data["parameters"],
                "nwp_wrf": nwp_data["parameters"]
            }
        }

"""
Inundation Prediction Service for SIH 2026 PS71
Calculates hydrological surface runoff, waterlogging risk tiers, and low-lying hotspot vulnerability.
"""

from datetime import datetime
from backend.config import Config
from backend.services.rainfall_service import RainfallService, ml_engine
from backend.database.mongodb import get_db_collection

class InundationService:
    @classmethod
    def get_inundation_assessment(cls, location_id: str, custom_rainfall_mm: float = None) -> dict:
        loc = RainfallService.get_location_metadata(location_id)
        
        # 1. Fetch rainfall forecast
        rainfall_data = RainfallService.get_unified_weather_and_prediction(location_id)
        predicted_3h_mm = custom_rainfall_mm if custom_rainfall_mm is not None else rainfall_data["prediction"]["predicted_rainfall_3h_mm"]
        prior_rain_1h_mm = rainfall_data["meteorological_telemetry"]["observational_aws"]["aws_rain_gauge_last_1h_mm"]
        
        # Soil saturation proxy derived from humidity and prior rain
        rh = rainfall_data["meteorological_telemetry"]["observational_aws"]["aws_rh_pct"]
        soil_sat = min(0.98, max(0.2, (rh / 100.0) * 0.65 + (prior_rain_1h_mm / 45.0) * 0.35))
        
        catchment_params = {
            "catchment_elevation_m": loc["catchment_elevation_m"],
            "catchment_slope_deg": loc["catchment_slope_deg"],
            "drainage_capacity_score": loc["drainage_capacity_score"],
            "soil_saturation_index": round(soil_sat, 2)
        }

        # 2. ML Inundation Inference
        inundation_result = ml_engine.predict_inundation_risk(catchment_params, predicted_3h_mm, prior_rain_1h_mm)
        base_depth = inundation_result["estimated_waterlogging_depth_cm"]
        risk_tier = inundation_result["inundation_risk_tier"]

        # 3. Model Localized Vulnerable Hotspots / Underpasses
        vulnerable_sectors = []
        for i, zone_name in enumerate(loc.get("vulnerable_zones", [])):
            # Micro-topographic depression variation
            depression_factor = 1.0 + (i * 0.22)
            sector_depth = round(base_depth * depression_factor, 1)
            
            if sector_depth >= 45.0:
                sec_risk = "SEVERE"
                action = "Close vehicular traffic immediately. Deploy high-capacity dewatering diesel pumps."
            elif sector_depth >= 20.0:
                sec_risk = "HIGH"
                action = "Traffic police detour advisory. Position emergency municipal quick-response teams."
            elif sector_depth >= 8.0:
                sec_risk = "MODERATE"
                action = "Monitor storm drain outfall. Clear trash grates."
            else:
                sec_risk = "LOW"
                action = "Normal flow. No immediate intervention required."

            vulnerable_sectors.append({
                "zone_name": zone_name,
                "relative_elevation": "Low-lying Depression" if i % 2 == 0 else "Bottleneck Underpass",
                "predicted_waterlogging_depth_cm": sector_depth,
                "sector_risk_tier": sec_risk,
                "recommended_action": action
            })

        # 4. Save to MongoDB
        inund_collection = get_db_collection("inundation_predictions")
        doc = {
            "location_id": location_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "predicted_rainfall_3h_mm": predicted_3h_mm,
            "inundation_result": inundation_result,
            "vulnerable_sectors": vulnerable_sectors,
            "data_fidelity": "SIMULATED_HYDROLOGICAL_MODEL"
        }
        try:
            inund_collection.insert_one(doc)
        except Exception as e:
            print(f"[InundationService] Inundation record insert warning: {e}")

        return {
            "location": loc,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data_fidelity": "SIMULATED_HYDROLOGICAL_MODEL",
            "hydrological_summary": inundation_result,
            "associated_rainfall_forecast": {
                "predicted_3h_accumulation_mm": predicted_3h_mm,
                "rainfall_intensity_class": rainfall_data["prediction"]["rainfall_intensity_class"],
                "prior_1h_gauge_mm": prior_rain_1h_mm
            },
            "localized_hotspots": vulnerable_sectors
        }

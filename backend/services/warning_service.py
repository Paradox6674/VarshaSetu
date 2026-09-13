"""
Early Warning Service for SIH 2026 PS71
Translates heavy rainfall and inundation predictions into standardized color-coded alerts:
- GREEN: No warning (Normal)
- YELLOW: Watch / Be Updated (Moderate rain & minor localized runoff)
- ORANGE: Alert / Be Prepared (Heavy rain & high inundation risk)
- RED: Warning / Take Action (Extremely heavy rain & severe inundation)
"""

from datetime import datetime, timedelta
from backend.config import Config
from backend.services.rainfall_service import RainfallService
from backend.services.inundation_service import InundationService
from backend.database.mongodb import get_db_collection

class WarningService:
    @classmethod
    def evaluate_location_warning(cls, location_id: str) -> dict:
        inundation_data = InundationService.get_inundation_assessment(location_id)
        loc = inundation_data["location"]
        rain_class = inundation_data["associated_rainfall_forecast"]["rainfall_intensity_class"]
        rain_mm = inundation_data["associated_rainfall_forecast"]["predicted_3h_accumulation_mm"]
        inund_tier = inundation_data["hydrological_summary"]["inundation_risk_tier"]
        depth_cm = inundation_data["hydrological_summary"]["estimated_waterlogging_depth_cm"]

        # Rigorous threshold classification
        if rain_class in ("Extremely Heavy", "Very Heavy") or inund_tier == "SEVERE":
            code = "RED"
            title = "RED WARNING: Take Immediate Action"
            urgency = "IMMEDIATE"
            instructions = [
                "Suspend non-essential vehicular movement through low-lying underpasses.",
                "Activate municipal emergency disaster control rooms and deploy high-flow dewatering pumps.",
                "Divert urban mass transit away from chronic waterlogging corridors.",
                "NDRF / SDRF teams placed on high standby for localized evacuation if required."
            ]
        elif rain_class == "Heavy" or inund_tier == "HIGH":
            code = "ORANGE"
            title = "ORANGE ALERT: Be Prepared"
            urgency = "EXPECTED_WITHIN_3_HOURS"
            instructions = [
                "Pre-position suction pumps at chronic bottleneck junctions.",
                "Issue public advisories regarding localized traffic diversions.",
                "Inspect open stormwater drains and clear accumulated municipal debris.",
                "Primary health centres to keep emergency trauma & rapid-response teams ready."
            ]
        elif rain_class == "Moderate" or inund_tier == "MODERATE":
            code = "YELLOW"
            title = "YELLOW WATCH: Be Updated"
            urgency = "MONITORING"
            instructions = [
                "Monitor radar reflectivity updates and automated rain gauge telemetry.",
                "Keep maintenance teams on standby for surface drain inspection.",
                "Citizens advised to check localized route status before travel."
            ]
        else:
            code = "GREEN"
            title = "GREEN: No Warning / Normal Conditions"
            urgency = "ROUTINE"
            instructions = [
                "No adverse weather or inundation threat detected.",
                "Routine meteorological observation in progress."
            ]

        now = datetime.utcnow()
        valid_until = (now + timedelta(hours=6)).isoformat() + "Z"

        warning_payload = {
            "warning_id": f"WRN_{location_id.upper()}_{int(now.timestamp())}",
            "location_id": location_id,
            "location_name": loc["name"],
            "region": loc["region"],
            "severity_color": code,
            "warning_title": title,
            "urgency": urgency,
            "issued_at": now.isoformat() + "Z",
            "valid_until": valid_until,
            "rainfall_trigger": {
                "predicted_3h_accumulation_mm": rain_mm,
                "intensity_class": rain_class
            },
            "inundation_trigger": {
                "risk_tier": inund_tier,
                "peak_waterlogging_depth_cm": depth_cm
            },
            "action_guidelines": instructions,
            "data_fidelity": "SIMULATED_PREDICTION_DRIVEN_ALERT"
        }

        # Persist warning in MongoDB
        warn_collection = get_db_collection("warnings")
        try:
            warn_collection.insert_one(warning_payload)
        except Exception as e:
            print(f"[WarningService] Warning save notice: {e}")

        return warning_payload

    @classmethod
    def get_all_active_warnings(cls) -> list:
        active = []
        for loc in Config.DEFAULT_LOCATIONS:
            active.append(cls.evaluate_location_warning(loc["id"]))
        # Sort by severity: RED first, then ORANGE, YELLOW, GREEN
        severity_order = {"RED": 0, "ORANGE": 1, "YELLOW": 2, "GREEN": 3}
        active.sort(key=lambda x: severity_order.get(x["severity_color"], 99))
        return active

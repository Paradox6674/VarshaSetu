"""
Numerical Weather Prediction (NWP) Model Ingestion Adapter for SIH 2026 PS71
Simulates / interfaces with mesoscale numerical prediction models (WRF 3km / NCMRWF Unified Model / GFS).
Extracts thermodynamic instability indices: CAPE, Precipitable Water (PWAT), and model precipitation fields.
"""

import math
import random
from datetime import datetime
from backend.adapters.base_adapter import BaseAdapter

class NWPAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="NCMRWF/IMD Mesoscale NWP (WRF-3km/Unified Model)", source_type="NWP_MODEL")
        self.model_resolution_km = 3.0
        self.model_cycles = ["00Z", "06Z", "12Z", "18Z"]
        self.mark_synced()

    def fetch_data(self, location_id: str, lat: float, lon: float) -> dict:
        now = datetime.utcnow()
        time_seed = int(now.timestamp() // 300)
        local_seed = (hash(f"{location_id}_{time_seed}") * 17) % 1000
        random.seed(local_seed)

        if "mumbai" in location_id:
            cape = round(random.uniform(2200.0, 3600.0), 1) # High maritime tropical instability
            pwat = round(random.uniform(58.0, 72.0), 1)
            precip_3h = round(random.uniform(25.0, 48.0), 1)
            lifted_index = round(random.uniform(-7.5, -4.5), 1)
        elif "guwahati" in location_id:
            cape = round(random.uniform(1900.0, 3100.0), 1)
            pwat = round(random.uniform(54.0, 68.0), 1)
            precip_3h = round(random.uniform(18.0, 38.0), 1)
            lifted_index = round(random.uniform(-6.0, -3.8), 1)
        elif "kochi" in location_id:
            cape = round(random.uniform(1600.0, 2700.0), 1)
            pwat = round(random.uniform(52.0, 65.0), 1)
            precip_3h = round(random.uniform(15.0, 32.0), 1)
            lifted_index = round(random.uniform(-5.0, -3.0), 1)
        elif "chennai" in location_id:
            cape = round(random.uniform(1100.0, 2100.0), 1)
            pwat = round(random.uniform(42.0, 56.0), 1)
            precip_3h = round(random.uniform(4.0, 16.0), 1)
            lifted_index = round(random.uniform(-3.5, -1.5), 1)
        else: # Bengaluru
            cape = round(random.uniform(800.0, 1600.0), 1)
            pwat = round(random.uniform(34.0, 46.0), 1)
            precip_3h = round(random.uniform(1.5, 9.0), 1)
            lifted_index = round(random.uniform(-2.5, 0.5), 1)

        payload = {
            "source_type": self.source_type,
            "model_identifier": "WRF-ARW_3KM_SOUTH_ASIA",
            "active_cycle": "06Z_ASSIMILATED",
            "data_fidelity": "SIMULATED_NWP_MESOSCALE_RUN",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location_id": location_id,
            "coordinates": {"lat": lat, "lon": lon},
            "parameters": {
                "nwp_precip_forecast_3h_mm": precip_3h,
                "nwp_cape_j_kg": cape,
                "nwp_pwat_mm": pwat,
                "lifted_index": lifted_index,
                "convective_inhibition_cin_j_kg": round(random.uniform(10.0, 45.0), 1),
                "low_level_convergence_10e5_s": round(random.uniform(2.5, 8.0) if cape > 2000 else random.uniform(0.5, 2.0), 2)
            },
            "model_metadata": {
                "physics_suite": "Thompson Microphysics / YSU PBL / Noah-LSM",
                "boundary_forcing": "NCMRWF Global NCUM 12km"
            }
        }
        self.mark_synced()
        return payload

    def health_check(self) -> dict:
        return {
            "source": self.name,
            "type": self.source_type,
            "status": "STREAMING_ACTIVE",
            "fidelity": "SIMULATED_DATA_ADAPTER",
            "last_sync": self.last_sync_time,
            "latency_ms": 210,
            "packet_loss_pct": 0.0,
            "nominal_frequency": "Every 6 hours (Global cycle initialization)",
            "adapter_integration_ready": True,
            "notes": "Ready for Open-Meteo GRIB2 / NCMRWF NetCDF4 pipeline ingestion"
        }

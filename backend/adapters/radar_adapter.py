"""
Doppler Weather Radar (DWR) Data Ingestion Adapter for SIH 2026 PS71
Simulates / interfaces with S-band and C-band dual-polarized Doppler Weather Radars.
Calculates reflectivity (Z in dBZ), Vertically Integrated Liquid (VIL), and Marshall-Palmer rain rate.
"""

import math
import random
from datetime import datetime
from backend.adapters.base_adapter import BaseAdapter
from ml.preprocessing.pipeline import marshall_palmer_rain_rate

class RadarAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="IMD Doppler Weather Radar (DWR) Network", source_type="RADAR")
        self.operating_band = "S-band (2.7-3.0 GHz) / C-band"
        self.sweep_interval_min = 10
        self.mark_synced()

    def fetch_data(self, location_id: str, lat: float, lon: float) -> dict:
        now = datetime.utcnow()
        time_seed = int(now.timestamp() // 300)
        local_seed = (hash(f"{location_id}_{time_seed}") * 7) % 1000
        random.seed(local_seed)

        # Base reflectivity values (dBZ)
        if "mumbai" in location_id:
            dbz = round(random.uniform(42.0, 56.5), 1) # Strong monsoon squall
        elif "guwahati" in location_id:
            dbz = round(random.uniform(38.0, 52.0), 1)
        elif "kochi" in location_id:
            dbz = round(random.uniform(35.0, 48.0), 1)
        elif "chennai" in location_id:
            dbz = round(random.uniform(28.0, 44.0), 1)
        else:
            dbz = round(random.uniform(18.0, 32.0), 1)

        # Physics: VIL and Echo Tops scale with dBZ
        vil_kg_m2 = round(max(0.5, (dbz / 10.0) ** 2.25 + random.uniform(-1.5, 1.5)), 1)
        echo_top_km = round(min(18.0, max(2.5, 2.8 + (dbz / 65.0) * 13.5 + random.uniform(-0.5, 0.8))), 1)
        
        # Hydrometeor classification based on dBZ
        if dbz >= 50.0:
            hydrometeor = "Torrenial Convective Downpour"
        elif dbz >= 40.0:
            hydrometeor = "Heavy Stratiform / Convective Rain"
        elif dbz >= 30.0:
            hydrometeor = "Moderate Rain"
        elif dbz >= 20.0:
            hydrometeor = "Light Rain / Drizzle"
        else:
            hydrometeor = "Cloud Droplets / Virga"

        mp_rate = marshall_palmer_rain_rate(dbz)

        payload = {
            "source_type": self.source_type,
            "radar_station": f"DWR_{location_id.upper()[:6]}_STATION",
            "operating_band": self.operating_band,
            "data_fidelity": "SIMULATED_DWR_POLARIMETRIC_VOLUME",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location_id": location_id,
            "coordinates": {"lat": lat, "lon": lon},
            "parameters": {
                "radar_reflectivity_dbz": dbz,
                "radar_vil_kg_m2": vil_kg_m2,
                "radar_echo_top_km": echo_top_km,
                "marshall_palmer_instantaneous_rate_mm_h": mp_rate,
                "hydrometeor_classification": hydrometeor,
                "radial_velocity_max_ms": round(random.uniform(12.0, 24.0) if dbz > 40 else random.uniform(4.0, 10.0), 1),
                "severe_convective_core": dbz >= 45.0
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
            "latency_ms": 98,
            "packet_loss_pct": 0.0,
            "sweep_interval_min": self.sweep_interval_min,
            "adapter_integration_ready": True,
            "notes": "Ready for IMD Radar NEXRAD/UF volume scan format ingestion"
        }

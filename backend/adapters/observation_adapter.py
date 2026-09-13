"""
Observational Automatic Weather Station (AWS) Data Adapter for SIH 2026 PS71
Simulates / interfaces with ground-level telemetry from calibrated Automatic Weather Stations (AWS)
and tipping-bucket electronic rain gauges.
"""

import math
import random
from datetime import datetime
from backend.adapters.base_adapter import BaseAdapter

class ObservationAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="Automatic Weather Station (AWS) Ground Network", source_type="OBSERVATIONAL")
        self.sensor_suite = ["Tipping Bucket Rain Gauge", "PTB110 Barometer", "Humicap Hygrometer", "Sonic Anemometer"]
        self.mark_synced()

    def fetch_data(self, location_id: str, lat: float, lon: float) -> dict:
        now = datetime.utcnow()
        time_seed = int(now.timestamp() // 300)
        local_seed = (hash(f"{location_id}_{time_seed}") * 13) % 1000
        random.seed(local_seed)

        if "mumbai" in location_id:
            temp = round(random.uniform(26.5, 29.2), 1)
            rh = round(random.uniform(88.0, 97.0), 1)
            pressure = round(random.uniform(996.0, 1001.5), 1)
            pressure_tendency = round(random.uniform(-3.2, -1.2), 2) # Steep monsoon drop
            rain_1h = round(random.uniform(18.5, 36.0), 2)
            rain_24h = round(rain_1h * 4.5 + random.uniform(40.0, 85.0), 1)
            wind_spd = round(random.uniform(9.0, 16.5), 1)
            wind_dir = round(random.uniform(220.0, 260.0), 1) # South-westerly monsoon flow
        elif "guwahati" in location_id:
            temp = round(random.uniform(25.0, 28.0), 1)
            rh = round(random.uniform(86.0, 96.0), 1)
            pressure = round(random.uniform(998.0, 1003.0), 1)
            pressure_tendency = round(random.uniform(-2.5, -0.8), 2)
            rain_1h = round(random.uniform(12.0, 28.0), 2)
            rain_24h = round(rain_1h * 3.8 + random.uniform(30.0, 60.0), 1)
            wind_spd = round(random.uniform(4.5, 10.0), 1)
            wind_dir = round(random.uniform(60.0, 110.0), 1)
        elif "kochi" in location_id:
            temp = round(random.uniform(26.0, 28.5), 1)
            rh = round(random.uniform(85.0, 95.0), 1)
            pressure = round(random.uniform(1002.0, 1005.0), 1)
            pressure_tendency = round(random.uniform(-1.8, -0.5), 2)
            rain_1h = round(random.uniform(10.0, 24.0), 2)
            rain_24h = round(rain_1h * 3.5 + random.uniform(25.0, 50.0), 1)
            wind_spd = round(random.uniform(6.0, 12.0), 1)
            wind_dir = round(random.uniform(240.0, 280.0), 1)
        elif "chennai" in location_id:
            temp = round(random.uniform(29.0, 32.5), 1)
            rh = round(random.uniform(72.0, 84.0), 1)
            pressure = round(random.uniform(1004.0, 1008.0), 1)
            pressure_tendency = round(random.uniform(-1.0, 0.2), 2)
            rain_1h = round(random.uniform(2.0, 10.0), 2)
            rain_24h = round(rain_1h * 2.5 + random.uniform(8.0, 25.0), 1)
            wind_spd = round(random.uniform(4.0, 8.5), 1)
            wind_dir = round(random.uniform(120.0, 170.0), 1)
        else: # Bengaluru
            temp = round(random.uniform(23.0, 27.0), 1)
            rh = round(random.uniform(68.0, 82.0), 1)
            pressure = round(random.uniform(1008.0, 1012.0), 1)
            pressure_tendency = round(random.uniform(-0.8, 0.4), 2)
            rain_1h = round(random.uniform(0.0, 6.5), 2)
            rain_24h = round(rain_1h * 2.0 + random.uniform(2.0, 12.0), 1)
            wind_spd = round(random.uniform(3.0, 7.0), 1)
            wind_dir = round(random.uniform(200.0, 250.0), 1)

        payload = {
            "source_type": self.source_type,
            "station_name": f"AWS_{location_id.upper()[:6]}_PRIME",
            "data_fidelity": "SIMULATED_AWS_SURFACE_TELEMETRY",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location_id": location_id,
            "coordinates": {"lat": lat, "lon": lon},
            "parameters": {
                "aws_temp_c": temp,
                "aws_rh_pct": rh,
                "aws_pressure_hpa": pressure,
                "aws_pressure_tendency_3h": pressure_tendency,
                "aws_rain_gauge_last_1h_mm": rain_1h,
                "aws_rain_gauge_last_24h_mm": rain_24h,
                "aws_wind_speed_ms": wind_spd,
                "aws_wind_dir_deg": wind_dir,
                "dew_point_c": round(temp - ((100.0 - rh) / 5.0), 1)
            },
            "sensor_diagnostics": {
                "tipping_bucket_status": "OPERATIONAL_NOMINAL",
                "calibration_valid_until": "2026-12-31",
                "battery_voltage": 12.6
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
            "latency_ms": 64,
            "packet_loss_pct": 0.0,
            "nominal_frequency": "Every 1 minute (Instantaneous tipping)",
            "adapter_integration_ready": True,
            "notes": "Ready for IMD AWS portal WMO FM-94 BUFR / JSON ingest"
        }

"""
Data Source Service for SIH 2026 PS71
Provides health checks, telemetry, streaming status, and adapter readiness for:
1. Satellite Data Stream
2. Radar Data Stream
3. Observational AWS Ground Stream
4. NWP Model Grid Stream
"""

from datetime import datetime
from backend.adapters import adapters

class DataSourceService:
    @staticmethod
    def get_all_streams_telemetry() -> dict:
        telemetry = {}
        for key, adapter in adapters.items():
            telemetry[key] = adapter.health_check()

        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "overall_status": "HEALTHY_SIMULATED_INTEGRATION",
            "active_streams_count": len(telemetry),
            "data_realism_declaration": "All streams currently utilize calibrated scientific simulation adapters. Architecture is decoupled and ready for live agency endpoints.",
            "streams": telemetry
        }

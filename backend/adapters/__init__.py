"""
Data Ingestion Adapters for SIH 2026 PS71
"""

from backend.adapters.satellite_adapter import SatelliteAdapter
from backend.adapters.radar_adapter import RadarAdapter
from backend.adapters.observation_adapter import ObservationAdapter
from backend.adapters.nwp_adapter import NWPAdapter

# Global adapter registry
adapters = {
    "satellite": SatelliteAdapter(),
    "radar": RadarAdapter(),
    "observation": ObservationAdapter(),
    "nwp": NWPAdapter()
}

def get_adapter(name: str):
    return adapters.get(name.lower())

def get_all_adapters():
    return adapters

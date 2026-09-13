"""
Base Meteorological Ingestion Adapter Interface for SIH 2026 PS71
Defines standard lifecycle, metadata, and data acquisition contract for all sources.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any

class BaseAdapter(ABC):
    def __init__(self, name: str, source_type: str):
        self.name = name
        self.source_type = source_type
        self.last_sync_time = None
        self.status = "INITIALIZING"
        self.mode = "SIMULATED"  # Explicitly defaults to SIMULATED for scientific realism

    @abstractmethod
    def fetch_data(self, location_id: str, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetches or simulates calibrated meteorological telemetry for a given location.
        Returns standardized dictionary.
        """
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Returns telemetry regarding adapter connectivity, ping, and data stream integrity.
        """
        pass

    def mark_synced(self):
        self.last_sync_time = datetime.utcnow().isoformat() + "Z"
        self.status = "CONNECTED_STREAMING"

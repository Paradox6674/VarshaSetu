"""
Automated Test Suite for SIH 2026 PS71 Flask REST API
Verifies endpoint responses, status codes, and prediction payload structures.
"""

import unittest
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app import create_app
from backend.config import Config

class TestPS71Backend(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "HEALTHY")
        self.assertIn("database", data)

    def test_get_locations(self):
        res = self.client.get("/api/locations")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertGreater(data["data"]["total_locations"], 0)

    def test_get_weather(self):
        res = self.client.get("/api/weather/mumbai_coastal")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        telemetry = data["data"]["meteorological_telemetry"]
        self.assertIn("radar_dwr", telemetry)
        self.assertIn("satellite_insat", telemetry)
        self.assertIn("observational_aws", telemetry)
        self.assertIn("nwp_wrf", telemetry)

    def test_rainfall_prediction(self):
        res = self.client.get("/api/predictions/rainfall/mumbai_coastal")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        pred = data["data"]["prediction"]
        self.assertIn("predicted_rainfall_3h_mm", pred)
        self.assertIn("rainfall_intensity_class", pred)
        self.assertIn("timeline", pred)
        self.assertGreater(len(pred["timeline"]), 0)

    def test_custom_rainfall_prediction_post(self):
        payload = {
            "radar_reflectivity_dbz": 54.0,
            "sat_brightness_temp_k": 204.0,
            "aws_rain_gauge_last_1h_mm": 28.0,
            "nwp_precip_forecast_3h_mm": 45.0,
            "nwp_cape_j_kg": 3200.0
        }
        res = self.client.post("/api/predictions/rainfall",
                               data=json.dumps(payload),
                               content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertIn(data["data"]["rainfall_intensity_class"], ["Heavy", "Very Heavy", "Extremely Heavy"])

    def test_inundation_prediction(self):
        res = self.client.get("/api/predictions/inundation/mumbai_coastal")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        inund = data["data"]["hydrological_summary"]
        self.assertIn(inund["inundation_risk_tier"], ["LOW", "MODERATE", "HIGH", "SEVERE"])
        self.assertIn("localized_hotspots", data["data"])

    def test_warnings_endpoint(self):
        res = self.client.get("/api/warnings")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["data"]["total_active_warnings"], 1)

    def test_data_sources_endpoint(self):
        res = self.client.get("/api/data-sources")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        streams = data["data"]["streams"]
        self.assertIn("satellite", streams)
        self.assertIn("radar", streams)
        self.assertIn("observation", streams)
        self.assertIn("nwp", streams)

if __name__ == "__main__":
    unittest.main()

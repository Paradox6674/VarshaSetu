"""
Configuration Module for SIH 2026 PS71 Backend
"""

import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "ps71-rainfall-inundation-secret-key-2026")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/sih2026_ps71")
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
    DATA_SOURCE_MODE = os.environ.get("DATA_SOURCE_MODE", "SIMULATED")  # "SIMULATED", "HISTORICAL", or "LIVE"
    
    # Supported Catchment/City Locations for PS71 Demonstration
    DEFAULT_LOCATIONS = [
        {
            "id": "mumbai_coastal",
            "name": "Mumbai Metropolitan Catchment",
            "region": "Konkan Coastal Zone, Maharashtra",
            "lat": 19.0760,
            "lon": 72.8777,
            "catchment_elevation_m": 8.0,
            "catchment_slope_deg": 1.2,
            "drainage_capacity_score": 4.2,
            "vulnerable_zones": ["Hindmata", "Milan Subway", "Kurla West", "Dharavi Canal Belt", "King's Circle"],
            "dwr_station": "DWR Mumbai (Colaba)",
            "primary_aws": "Santacruz AWS-01"
        },
        {
            "id": "chennai_basin",
            "name": "Chennai Basin & Adyar Catchment",
            "region": "Coromandel Coastal Belt, Tamil Nadu",
            "lat": 13.0827,
            "lon": 80.2707,
            "catchment_elevation_m": 6.5,
            "catchment_slope_deg": 0.8,
            "drainage_capacity_score": 3.8,
            "vulnerable_zones": ["Velachery", "Mudichur", "Saidapet Bridge", "Madipakkam", "Kolathur"],
            "dwr_station": "DWR Chennai (Port)",
            "primary_aws": "Meenambakkam AWS-04"
        },
        {
            "id": "guwahati_brahmaputra",
            "name": "Guwahati Urban Hills & Floodplain",
            "region": "Brahmaputra Valley, Assam",
            "lat": 26.1445,
            "lon": 91.7362,
            "catchment_elevation_m": 54.0,
            "catchment_slope_deg": 6.5,
            "drainage_capacity_score": 4.5,
            "vulnerable_zones": ["Anil Nagar", "Nabin Nagar", "Rukminigaon", "Zoo Road", "Bharalu Basin"],
            "dwr_station": "DWR Mohanbari / Agartala Link",
            "primary_aws": "Borjhar AWS-02"
        },
        {
            "id": "kochi_backwaters",
            "name": "Kochi Backwaters & Coastal Lowlands",
            "region": "Malabar Coast, Kerala",
            "lat": 9.9312,
            "lon": 76.2673,
            "catchment_elevation_m": 4.0,
            "catchment_slope_deg": 0.5,
            "drainage_capacity_score": 5.0,
            "vulnerable_zones": ["Edappally", "MG Road South", "Kalamassery", "Thevara Canal", "West Kochi"],
            "dwr_station": "DWR Kochi (Kadamakkudy)",
            "primary_aws": "Cochin Naval AWS"
        },
        {
            "id": "bengaluru_valley",
            "name": "Bengaluru Vrishabhavathi Valley",
            "region": "Deccan Plateau, Karnataka",
            "lat": 12.9716,
            "lon": 77.5946,
            "catchment_elevation_m": 920.0,
            "catchment_slope_deg": 3.4,
            "drainage_capacity_score": 4.0,
            "vulnerable_zones": ["Bellandur Lake Inflow", "HBR Layout", "Silk Board Junction", "Rainbow Drive", "Manyata Tech Park"],
            "dwr_station": "DWR Bengaluru (Peenya)",
            "primary_aws": "HAL Airport AWS"
        }
    ]

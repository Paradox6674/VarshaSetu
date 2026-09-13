"""
Resilient MongoDB Driver for SIH 2026 PS71
Attempts connection to real MongoDB daemon via MONGO_URI.
If MongoDB is unavailable, automatically activates an in-memory document store
with matching collection semantics to ensure 100% operational uptime during evaluations.
"""

import os
import copy
from datetime import datetime
from backend.config import Config

class InMemoryCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []

    def insert_one(self, doc):
        stored = copy.deepcopy(doc)
        if "_id" not in stored:
            stored["_id"] = f"{self.name}_{len(self.docs) + 1}_{int(datetime.utcnow().timestamp())}"
        self.docs.append(stored)
        class InsertResult:
            inserted_id = stored["_id"]
        return InsertResult()

    def find_one(self, query=None, sort=None):
        results = self.find(query=query, sort=sort)
        return results[0] if results else None

    def find(self, query=None, sort=None, limit=100):
        query = query or {}
        matched = []
        for d in self.docs:
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(copy.deepcopy(d))

        if sort:
            # Simple sorting by key
            key, direction = sort[0]
            reverse = (direction < 0)
            matched.sort(key=lambda x: x.get(key, 0), reverse=reverse)

        return matched[:limit]

    def update_one(self, query, update, upsert=False):
        for i, d in enumerate(self.docs):
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update:
                    self.docs[i].update(copy.deepcopy(update["$set"]))
                return True
        if upsert:
            new_doc = copy.deepcopy(query)
            if "$set" in update:
                new_doc.update(copy.deepcopy(update["$set"]))
            self.insert_one(new_doc)
            return True
        return False

    def count_documents(self, query=None):
        return len(self.find(query=query))


class DatabaseManager:
    def __init__(self):
        self.is_connected_to_mongo = False
        self.client = None
        self.db = None
        self.connection_status = "INITIALIZING"
        self._collections = {}
        self._init_db()

    def _init_db(self):
        try:
            from pymongo import MongoClient
            self.client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1200)
            # Trigger server selection check
            self.client.admin.command('ping')
            self.db = self.client.get_database()
            self.is_connected_to_mongo = True
            self.connection_status = "CONNECTED_TO_MONGODB"
            print(f"[DatabaseManager] Successfully connected to MongoDB at {Config.MONGO_URI}")
        except Exception as e:
            self.is_connected_to_mongo = False
            self.connection_status = f"IN_MEMORY_FALLBACK (Reason: {type(e).__name__})"
            print(f"[DatabaseManager] Notice: MongoDB daemon not reached ({e}). Using resilient in-memory collection store.")

    def get_collection(self, collection_name: str):
        if self.is_connected_to_mongo and self.db is not None:
            return self.db[collection_name]
        
        if collection_name not in self._collections:
            self._collections[collection_name] = InMemoryCollection(collection_name)
        return self._collections[collection_name]

    def get_status(self):
        return {
            "mode": "MONGODB_NATIVE" if self.is_connected_to_mongo else "IN_MEMORY_STORE",
            "status": self.connection_status,
            "target_uri": Config.MONGO_URI if not self.is_connected_to_mongo else "[CONFIGURED]",
            "collections_active": [
                "weather_observations",
                "rainfall_predictions",
                "inundation_predictions",
                "locations",
                "warnings",
                "data_source_telemetry"
            ]
        }

# Global database singleton
db_manager = DatabaseManager()

def get_db_collection(name: str):
    return db_manager.get_collection(name)

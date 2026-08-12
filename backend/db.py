import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger("civiclens.db")

class FileCollection:
    """Embedded JSON file-backed collection fallback with MongoDB PyMongo compatible interface."""
    def __init__(self, name: str, filepath: str):
        self.name = name
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def _load_data(self) -> List[Dict[str, Any]]:
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {self.filepath}: {e}")
            return []

    def _save_data(self, data: List[Dict[str, Any]]):
        with open(self.filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)

    def _match(self, item: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, val in query.items():
            if key.startswith("$"):
                continue
            if isinstance(val, dict):
                # Simple operator checks
                if "$in" in val:
                    if item.get(key) not in val["$in"]:
                        return False
                if "$regex" in val:
                    import re
                    pattern = val["$regex"]
                    options = val.get("$options", "")
                    flags = re.IGNORECASE if "i" in options else 0
                    if not re.search(pattern, str(item.get(key, "")), flags):
                        return False
            else:
                if item.get(key) != val:
                    return False
        return True

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        query = query or {}
        data = self._load_data()
        results = [item for item in data if self._match(item, query)]
        return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        results = self.find(query)
        return results[0] if results else None

    def insert_one(self, doc: Dict[str, Any]) -> Any:
        data = self._load_data()
        doc_copy = dict(doc)
        if "_id" not in doc_copy and "id" in doc_copy:
            doc_copy["_id"] = doc_copy["id"]
        elif "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
            if "id" not in doc_copy:
                doc_copy["id"] = doc_copy["_id"]

        data.append(doc_copy)
        self._save_data(data)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        data = self._load_data()
        updated = False
        for item in data:
            if self._match(item, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        item[k] = v
                if "$push" in update:
                    for k, v in update["$push"].items():
                        if k not in item or not isinstance(item[k], list):
                            item[k] = []
                        item[k].append(v)
                updated = True
                break
        if updated:
            self._save_data(data)
        return updated

    def delete_one(self, query: Dict[str, Any]) -> bool:
        data = self._load_data()
        initial_len = len(data)
        data = [item for item in data if not self._match(item, query)]
        if len(data) < initial_len:
            self._save_data(data)
            return True
        return False

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))


class DatabaseManager:
    """Hybrid MongoDB client that connects to MongoDB or falls back to FileCollection."""
    def __init__(self):
        self.is_mongodb = False
        self.client = None
        self.db = None
        self.data_dir = os.path.join(os.path.dirname(__file__), "data_store")
        self._collections: Dict[str, FileCollection] = {}
        self.init_db()

    def init_db(self):
        mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
        try:
            from pymongo import MongoClient
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1000)
            client.server_info()  # Test connection
            self.client = client
            self.db = client["civiclens"]
            self.is_mongodb = True
            logger.info("Connected to MongoDB successfully.")
        except Exception:
            logger.info("MongoDB connection failed or server offline. Using embedded JSON file storage driver.")
            self.is_mongodb = False
            os.makedirs(self.data_dir, exist_ok=True)

    def get_collection(self, name: str):
        if self.is_mongodb:
            return self.db[name]
        if name not in self._collections:
            filepath = os.path.join(self.data_dir, f"{name}.json")
            self._collections[name] = FileCollection(name, filepath)
        return self._collections[name]

db_manager = DatabaseManager()

def get_db():
    return db_manager


"""
In-memory data store abstraction for GameDev Hub.
Designed to be swapped for SQLAlchemy/Postgres later.
"""
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime
from copy import deepcopy
import threading
import uuid

class Collection:
    def __init__(self, name: str):
        self.name = name
        self._docs: Dict[str, Dict] = {}
        self._lock = threading.RLock()

    def insert(self, doc: Dict) -> Dict:
        with self._lock:
            doc = deepcopy(doc)
            if "id" not in doc:
                doc["id"] = str(uuid.uuid4())[:12]
            doc["_created"] = datetime.utcnow().isoformat() + "Z"
            doc["_updated"] = doc["_created"]
            self._docs[doc["id"]] = doc
            return deepcopy(doc)

    def find_by_id(self, doc_id: str) -> Optional[Dict]:
        with self._lock:
            doc = self._docs.get(doc_id)
            return deepcopy(doc) if doc else None

    def find(self, predicate: Optional[Callable] = None, limit: int = 100) -> List[Dict]:
        with self._lock:
            results = []
            for doc in self._docs.values():
                if predicate is None or predicate(doc):
                    results.append(deepcopy(doc))
                if len(results) >= limit:
                    break
            return results

    def update(self, doc_id: str, updates: Dict) -> Optional[Dict]:
        with self._lock:
            if doc_id not in self._docs:
                return None
            self._docs[doc_id].update(updates)
            self._docs[doc_id]["_updated"] = datetime.utcnow().isoformat() + "Z"
            return deepcopy(self._docs[doc_id])

    def delete(self, doc_id: str) -> bool:
        with self._lock:
            if doc_id in self._docs:
                del self._docs[doc_id]
                return True
            return False

    def count(self) -> int:
        with self._lock:
            return len(self._docs)

    def clear(self):
        with self._lock:
            self._docs.clear()


class Database:
    def __init__(self):
        self._collections: Dict[str, Collection] = {}
        self._lock = threading.Lock()

    def collection(self, name: str) -> Collection:
        with self._lock:
            if name not in self._collections:
                self._collections[name] = Collection(name)
            return self._collections[name]

    def list_collections(self) -> List[str]:
        with self._lock:
            return list(self._collections.keys())

    def stats(self) -> Dict[str, Any]:
        with self._lock:
            return {name: col.count() for name, col in self._collections.items()}


# Singleton
db = Database()

def get_db() -> Database:
    return db

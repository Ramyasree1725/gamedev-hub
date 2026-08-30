
"""
Search API routes for GameDev Hub.
Blueprint providing REST endpoints related to search.
"""
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import hashlib
import random
import string

bp = Blueprint("search", __name__, url_prefix="/api/search")

# In-memory stores for this module
_store: Dict[str, Any] = {}
_counter = 0

def _id() -> str:
    global _counter
    _counter += 1
    return f"search_{_counter:06d}_" + "".join(random.choices(string.ascii_lowercase, k=6))

@bp.route("/", methods=["GET"])
def list_items():
    """List all items for search."""
    items = list(_store.values())
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({
        "items": items[start:end],
        "total": len(items),
        "page": page,
        "per_page": per_page,
        "module": "search",
    })

@bp.route("/<item_id>", methods=["GET"])
def get_item(item_id: str):
    """Retrieve a single item by ID."""
    item = _store.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    return jsonify(item)

@bp.route("/", methods=["POST"])
def create_item():
    """Create a new search resource."""
    data = request.get_json() or {}
    item_id = _id()
    record = {
        "id": item_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "module": "search",
        **data,
    }
    _store[item_id] = record
    return jsonify(record), 201

@bp.route("/<item_id>", methods=["PUT", "PATCH"])
def update_item(item_id: str):
    """Update an existing item."""
    if item_id not in _store:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json() or {}
    _store[item_id].update(data)
    _store[item_id]["updated_at"] = datetime.utcnow().isoformat() + "Z"
    return jsonify(_store[item_id])

@bp.route("/<item_id>", methods=["DELETE"])
def delete_item(item_id: str):
    """Delete an item."""
    if item_id not in _store:
        return jsonify({"error": "Not found"}), 404
    del _store[item_id]
    return jsonify({"success": True, "deleted": item_id})

@bp.route("/stats", methods=["GET"])
def stats():
    """Return aggregate stats for this module."""
    return jsonify({
        "module": "search",
        "count": len(_store),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })

@bp.route("/search", methods=["GET"])
def search():
    """Simple search across stored items."""
    q = (request.args.get("q") or "").lower()
    results = []
    for item in _store.values():
        blob = str(item).lower()
        if q in blob:
            results.append(item)
    return jsonify({"query": q, "results": results[:50], "count": len(results)})

# Domain-specific helpers for search
class SearchService:
    """Service class encapsulating search business logic."""

    def __init__(self):
        self.name = "search"
        self.created = datetime.utcnow()

    def process(self, payload: Dict) -> Dict:
        """Process a payload and return enriched result."""
        result = dict(payload)
        result["_processed_by"] = self.name
        result["_processed_at"] = datetime.utcnow().isoformat() + "Z"
        result["_hash"] = hashlib.sha256(str(payload).encode()).hexdigest()[:16]
        return result

    def validate(self, payload: Dict) -> tuple:
        if not isinstance(payload, dict):
            return False, "Payload must be an object"
        return True, "OK"

    def batch_process(self, items: List[Dict]) -> List[Dict]:
        return [self.process(i) for i in items]

    def health(self) -> Dict:
        return {
            "service": self.name,
            "status": "ok",
            "uptime": (datetime.utcnow() - self.created).total_seconds(),
            "store_size": len(_store),
        }

def get_service() -> SearchService:
    return SearchService()

# Seed sample data
def seed():
    for n in range(5):
        item_id = _id()
        _store[item_id] = {
            "id": item_id,
            "name": f"Sample search {n+1}",
            "value": random.randint(10, 1000),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "module": "search",
        }

seed()

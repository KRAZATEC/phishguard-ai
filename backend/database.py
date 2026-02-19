"""
Database module — uses MongoDB (Motor) when MONGODB_URL is configured,
falls back to an in-memory store automatically for local development/demo.
"""
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "")
DB_NAME = os.getenv("DB_NAME", "phishguard")

# Check for empty string OR default placeholders
is_placeholder = any(p in MONGO_URL for p in ["<password>", "your_password", "cluster0.mongodb.net", "ReplaceWithYourConnectionString"])
USE_MEMORY = not MONGO_URL or MONGO_URL.strip() == "" or is_placeholder

if USE_MEMORY:
    print("\n" + "="*80)
    print("⚠️  MONGODB CONNECTION SKIPPED — RUNNING IN MEMORY MODE")
    print("    Reason: MONGODB_URL is missing or contains placeholder values.")
    print("    Data will be lost when the server restarts.")
    print("    To persist data: update backend/.env with a real MongoDB Atlas URL.")
    print("="*80 + "\n")

    # ─── In-memory collections ────────────────────────────────────────────────
    from datetime import datetime
    import uuid

    class MemoryCollection:
        """Minimal async-compatible MongoDB-like collection backed by a list."""

        def __init__(self):
            self._docs = []

        async def find_one(self, query: dict):
            for doc in self._docs:
                if self._matches(doc, query):
                    return dict(doc)
            return None

        async def insert_one(self, doc: dict):
            new_doc = dict(doc)
            new_doc["_id"] = str(uuid.uuid4())
            self._docs.append(new_doc)

            class Result:
                inserted_id = new_doc["_id"]
            return Result()

        async def count_documents(self, query: dict):
            return sum(1 for doc in self._docs if self._matches(doc, query))

        def find(self, query: dict):
            return _MemoryCursor([dict(d) for d in self._docs if self._matches(d, query)])

        def _matches(self, doc: dict, query: dict) -> bool:
            for key, value in query.items():
                if key == "timestamp" and isinstance(value, dict):
                    ts = doc.get("timestamp")
                    if ts is None:
                        return False
                    if "$gte" in value and ts < value["$gte"]:
                        return False
                    if "$lt" in value and ts >= value["$lt"]:
                        return False
                elif doc.get(key) != value:
                    return False
            return True

    class _MemoryCursor:
        def __init__(self, docs):
            self._docs = docs
            self._sort_key = None
            self._sort_dir = 1
            self._limit_n = None

        def sort(self, key, direction):
            self._sort_key = key
            self._sort_dir = direction
            return self

        def limit(self, n):
            self._limit_n = n
            return self

        def __aiter__(self):
            docs = self._docs
            if self._sort_key:
                docs = sorted(docs, key=lambda d: d.get(self._sort_key, 0),
                              reverse=(self._sort_dir == -1))
            if self._limit_n:
                docs = docs[:self._limit_n]
            self._iter_docs = iter(docs)
            return self

        async def __anext__(self):
            try:
                return next(self._iter_docs)
            except StopIteration:
                raise StopAsyncIteration

    users_collection = MemoryCollection()
    scans_collection = MemoryCollection()
    reports_collection = MemoryCollection()

else:
    from motor.motor_asyncio import AsyncIOMotorClient
    import certifi
    
    client = AsyncIOMotorClient(
        MONGO_URL, 
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where()
    )
    db = client[DB_NAME]
    users_collection = db["users"]
    scans_collection = db["scans"]
    reports_collection = db["reports"]
    print(f"✅ Connected to MongoDB Atlas: {DB_NAME}")

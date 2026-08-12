import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for ai-prototype
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env if present
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)

# API Keys & Models
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "claude-3-5-sonnet-20241022")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Chunking Configuration
CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "50"))

# Retrieval Configuration
TOP_K = int(os.environ.get("TOP_K", "5"))
RELEVANCE_THRESHOLD = float(os.environ.get("RELEVANCE_THRESHOLD", "0.3"))

# Paths
DOCUMENTS_DIR = BASE_DIR / "documents" / "demo"
INDEX_CACHE_PATH = BASE_DIR / "documents" / "index_cache.pkl"

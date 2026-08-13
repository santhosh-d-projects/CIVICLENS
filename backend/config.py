import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "civiclens_super_secret_dev_key_2026")
    JWT_SECRET = os.environ.get("JWT_SECRET", "civiclens_jwt_secret_key_2026")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/civiclens")
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://127.0.0.1:8000")


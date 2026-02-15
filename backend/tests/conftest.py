import os


# Ensure app settings can be initialized in tests without local .env.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("INTERNAL_SECRET", "test-internal-secret")

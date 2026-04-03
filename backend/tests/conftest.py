# ── IMPORTANT: Patch postgresql.JSONB → JSON before any app code is imported ──
import sqlalchemy.dialects.postgresql as _pg
from sqlalchemy import types as _sa_types
_pg.JSONB = _sa_types.JSON
# ──────────────────────────────────────────────────────────────────────────────

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
import models
from auth import create_access_token

# StaticPool: all sessions share the same in-memory SQLite connection,
# so test data created before requests is visible inside endpoint sessions.
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    # Each request gets its own session; StaticPool ensures they all see
    # the same in-memory SQLite database as the `db` fixture session.
    def override_get_db():
        request_db = TestingSessionLocal()
        try:
            yield request_db
        finally:
            request_db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db):
    """A regular crew-role user in the test DB."""
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    user = models.User(
        full_name="Test Sailor",
        email="sailor@example.com",
        hashed_password=pwd.hash("password123"),
        role="crew",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def auth_headers(test_user):
    """Bearer token headers for test_user."""
    token = create_access_token({"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}

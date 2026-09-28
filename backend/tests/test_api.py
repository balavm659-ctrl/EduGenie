"""
EduGenie Backend Integration & Unit Tests
Tests authentication, validation, health checks, and database models.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import backend.models
from backend.main import app
from backend.database import Base, get_db

# Use StaticPool so that in-memory SQLite maintains tables across connections
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables on in-memory engine
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health_check():
    """Verify health check endpoint returns 200 and valid JSON."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "EduGenie"


def test_registration_and_login_flow():
    """Test full student onboarding flow: registration, duplicate check, and login."""
    unique_email = "test_student@example.com"
    reg_payload = {
        "name": "Test Learner",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "education_level": "Undergraduate",
        "preferred_language": "english"
    }

    # 1. Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email
    token = reg_data["access_token"]

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Get Current User (/me)
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Test Learner"


def test_unauthorized_access_protection():
    """Verify that protected routes reject requests without a valid token."""
    response = client.get("/api/progress")
    assert response.status_code in (401, 403)


def test_onboarding_submission():
    """Test updating onboarding preferences."""
    # Register a new user
    user_payload = {
        "name": "Onboarding User",
        "email": "onboarding@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    reg_res = client.post("/api/auth/register", json=user_payload)
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Complete onboarding
    onboard_payload = {
        "interests": ["Python", "Machine Learning"],
        "current_level": "beginner",
        "learning_style": "practice",
        "preferred_language": "tamil"
    }
    onboard_res = client.post("/api/auth/onboarding", json=onboard_payload, headers=headers)
    assert onboard_res.status_code == 200
    data = onboard_res.json()
    assert data["onboarding_completed"] is True
    assert "Python" in data["interests"]
    assert data["preferred_language"] == "tamil"

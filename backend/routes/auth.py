"""
EduGenie Authentication Routes
Registration, login, profile, and onboarding endpoints.
"""

from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LearningActivity
from ..schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    UserResponse, OnboardingRequest, ProfileUpdateRequest,
)
from ..services.auth_service import (
    hash_password, create_access_token,
    authenticate_user, get_current_user,
)
from ..config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    # Create user
    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        education_level=req.education_level,
        preferred_language=req.preferred_language,
        last_active_date=date.today(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log activity
    activity = LearningActivity(
        user_id=user.id,
        activity_type="register",
        topic="Account",
        details="Account created",
    )
    db.add(activity)
    db.commit()

    # Create token
    token = create_access_token(user.id, user.email)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Update streak
    today = date.today()
    if user.last_active_date:
        days_diff = (today - user.last_active_date).days
        if days_diff == 1:
            user.streak_count += 1
            # Streak bonus XP
            user.xp += settings.XP_DAILY_STREAK_BONUS
        elif days_diff > 1:
            user.streak_count = 1
        # If same day, don't change streak
    else:
        user.streak_count = 1

    user.last_active_date = today
    db.commit()

    token = create_access_token(user.id, user.email)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.post("/onboarding", response_model=UserResponse)
def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete onboarding with learning preferences."""
    current_user.interests = req.interests
    current_user.current_level = req.current_level
    current_user.learning_style = req.learning_style
    current_user.preferred_language = req.preferred_language
    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)

    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile settings."""
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)

    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout():
    """Logout (client-side token removal)."""
    return {"message": "Successfully logged out"}

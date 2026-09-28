"""
EduGenie Pydantic Schemas
Request/response validation models for all API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any, Dict
from datetime import datetime


# ──────────────────────── Auth Schemas ────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str
    education_level: str = ""
    preferred_language: str = "english"

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    education_level: str
    current_level: str
    preferred_language: str
    learning_style: str
    interests: List[str]
    onboarding_completed: bool
    xp: int
    streak_count: int
    theme: str
    created_at: datetime

    class Config:
        from_attributes = True


class OnboardingRequest(BaseModel):
    interests: List[str] = []
    current_level: str = "beginner"
    learning_style: str = "mixed"
    preferred_language: str = "english"


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    education_level: Optional[str] = None
    current_level: Optional[str] = None
    preferred_language: Optional[str] = None
    learning_style: Optional[str] = None
    interests: Optional[List[str]] = None
    theme: Optional[str] = None


# ──────────────────────── AI Schemas ────────────────────────

class QARequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[int] = None
    language: Optional[str] = None


class QAResponse(BaseModel):
    answer: str
    conversation_id: int
    message_id: int


class ExplainRequest(BaseModel):
    concept: str = Field(..., min_length=1, max_length=500)
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    style: str = "simple"  # simple, detailed, exam, example, analogy
    language: Optional[str] = None


class ExplainResponse(BaseModel):
    explanation: str
    concept: str
    difficulty: str
    style: str


class QuizRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    num_questions: int = Field(default=10, ge=3, le=30)
    difficulty: str = "medium"  # easy, medium, hard
    question_type: str = "mcq"  # mcq
    language: Optional[str] = None


class QuizQuestion(BaseModel):
    question: str
    options: Dict[str, str]  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer: str  # "A", "B", "C", or "D"
    explanation: str


class QuizGenerateResponse(BaseModel):
    quiz_id: int
    topic: str
    difficulty: str
    num_questions: int
    questions: List[QuizQuestion]


class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: List[str]  # list of "A", "B", "C", "D"
    time_taken: int = 0  # seconds


class QuizResultResponse(BaseModel):
    quiz_id: int
    topic: str
    score: int
    total: int
    percentage: float
    time_taken: int
    correct_answers: List[int]
    wrong_answers: List[int]
    questions: List[QuizQuestion]
    user_answers: List[str]
    weak_areas: List[str]
    recommendations: List[str]


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    length: str = "medium"  # short, medium, detailed
    language: Optional[str] = None


class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    important_terms: List[str]
    revision_notes: str
    one_minute_revision: str


class LearningPathRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    current_level: str = "beginner"
    hours_per_day: float = Field(default=1.0, ge=0.5, le=12)
    goal: str = ""
    duration: str = "4 weeks"
    language: Optional[str] = None


class LearningPathWeek(BaseModel):
    week: int
    title: str
    topics: List[Dict[str, Any]]
    practice_task: str
    quiz_topic: str


class LearningPathResponse(BaseModel):
    path_id: int
    topic: str
    level: str
    duration: str
    weeks: List[LearningPathWeek]
    total_topics: int


class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, str]]
    weak_topics: List[Dict[str, Any]]
    suggested_quizzes: List[str]
    next_steps: List[str]


# ──────────────────────── Chat Schemas ────────────────────────

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    id: int
    title: str
    messages: List[MessageResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationRenameRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


# ──────────────────────── Progress Schemas ────────────────────────

class ProgressResponse(BaseModel):
    total_xp: int
    streak_count: int
    total_questions: int
    quizzes_completed: int
    quiz_average: float
    topics_completed: int
    total_learning_hours: float
    strong_topics: List[Dict[str, Any]]
    weak_topics: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    badges: List[Dict[str, Any]]
    weekly_activity: List[Dict[str, Any]]


class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    topic: str
    details: Optional[str]
    xp_earned: int
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── Saved Items Schemas ────────────────────────

class SavedItemCreate(BaseModel):
    item_type: str = Field(..., pattern="^(explanation|question|quiz|summary|learning_path)$")
    title: str = Field(..., min_length=1, max_length=300)
    content: str
    metadata_json: Optional[Dict[str, Any]] = None


class SavedItemResponse(BaseModel):
    id: int
    item_type: str
    title: str
    content: str
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── Badge Schemas ────────────────────────

class BadgeResponse(BaseModel):
    id: int
    badge_type: str
    badge_name: str
    description: str
    earned_at: datetime

    class Config:
        from_attributes = True


# Resolve forward reference
TokenResponse.model_rebuild()

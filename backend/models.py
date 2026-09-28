"""
EduGenie Database Models
All SQLAlchemy ORM models for the application.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, Date, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base


class User(Base):
    """Student user account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    education_level = Column(String(50), default="")
    current_level = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    preferred_language = Column(String(20), default="english")  # english, tamil, tanglish
    learning_style = Column(String(30), default="mixed")  # explanations, practice, quizzes, projects, mixed
    interests = Column(JSON, default=list)  # list of topics
    onboarding_completed = Column(Boolean, default=False)
    xp = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    theme = Column(String(10), default="light")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("LearningActivity", back_populates="user", cascade="all, delete-orphan")
    saved_items = relationship("SavedItem", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("Badge", back_populates="user", cascade="all, delete-orphan")
    topic_performances = relationship("TopicPerformance", back_populates="user", cascade="all, delete-orphan")


class Conversation(Base):
    """Chat conversation container."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan",
                            order_by="Message.created_at")


class Message(Base):
    """Individual message in a conversation."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Quiz(Base):
    """Quiz attempt with questions and results."""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    num_questions = Column(Integer, default=10)
    questions = Column(JSON, nullable=True)  # list of question objects
    user_answers = Column(JSON, nullable=True)  # list of user's selected answers
    score = Column(Integer, nullable=True)
    total = Column(Integer, nullable=True)
    time_taken = Column(Integer, nullable=True)  # seconds
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="quizzes")


class LearningPath(Base):
    """Personalized learning path for a topic."""
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    level = Column(String(20), default="beginner")
    goal = Column(String(500), default="")
    duration = Column(String(50), default="")
    hours_per_day = Column(Float, default=1.0)
    content = Column(JSON, nullable=True)  # structured learning path
    progress = Column(Float, default=0.0)  # 0 to 100
    completed_items = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="learning_paths")


class LearningActivity(Base):
    """Track all learning activities for analytics."""
    __tablename__ = "learning_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(30), nullable=False)  # qa, explain, quiz, summary, learning_path, login
    topic = Column(String(200), default="")
    details = Column(Text, nullable=True)
    xp_earned = Column(Integer, default=0)
    duration = Column(Integer, default=0)  # minutes
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")


class SavedItem(Base):
    """User-saved learning content."""
    __tablename__ = "saved_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(String(30), nullable=False)  # explanation, question, quiz, summary, learning_path
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_items")


class Badge(Base):
    """Achievement badge earned by user."""
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_type = Column(String(50), nullable=False)
    badge_name = Column(String(100), nullable=False)
    description = Column(String(300), default="")
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")


class TopicPerformance(Base):
    """Track performance per topic for weak-area detection."""
    __tablename__ = "topic_performances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(200), nullable=False)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    last_attempted = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="topic_performances")

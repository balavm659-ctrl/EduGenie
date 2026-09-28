"""
EduGenie Progress Routes
Learning analytics, activity history, streak, and topic performance.
"""

from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from ..database import get_db
from ..models import (
    User, Quiz, LearningActivity, LearningPath,
    TopicPerformance, Badge, Conversation,
)
from ..schemas import ProgressResponse, ActivityResponse, BadgeResponse
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Progress"])


@router.get("/progress", response_model=ProgressResponse)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get comprehensive learning progress analytics."""
    user_id = current_user.id

    # Quiz stats
    quizzes = db.query(Quiz).filter(
        Quiz.user_id == user_id,
        Quiz.completed == True,
    ).all()

    quiz_avg = 0.0
    if quizzes:
        scores = [(q.score / q.total * 100) for q in quizzes if q.total > 0]
        quiz_avg = sum(scores) / len(scores) if scores else 0

    # Activity count
    total_questions = db.query(LearningActivity).filter(
        LearningActivity.user_id == user_id,
        LearningActivity.activity_type == "qa",
    ).count()

    # Topics
    topic_perfs = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id,
    ).all()

    strong_topics = [
        {"topic": tp.topic, "score": round(tp.average_score, 1), "attempts": tp.attempts}
        for tp in topic_perfs if tp.average_score >= 70
    ]
    weak_topics = [
        {"topic": tp.topic, "score": round(tp.average_score, 1), "attempts": tp.attempts}
        for tp in topic_perfs if tp.average_score < 70
    ]

    # Learning paths completed
    completed_paths = db.query(LearningPath).filter(
        LearningPath.user_id == user_id,
        LearningPath.progress >= 100,
    ).count()

    # Estimate total learning hours from activity count
    total_activities = db.query(LearningActivity).filter(
        LearningActivity.user_id == user_id,
    ).count()
    estimated_hours = round(total_activities * 0.15, 1)  # ~9 min per activity

    # Recent activity
    recent = db.query(LearningActivity).filter(
        LearningActivity.user_id == user_id,
    ).order_by(LearningActivity.created_at.desc()).limit(10).all()

    recent_list = [
        {
            "type": a.activity_type,
            "topic": a.topic,
            "details": a.details,
            "xp": a.xp_earned,
            "created_at": a.created_at.isoformat(),
        }
        for a in recent
    ]

    # Badges
    badges = db.query(Badge).filter(Badge.user_id == user_id).all()
    badge_list = [
        {
            "type": b.badge_type,
            "name": b.badge_name,
            "description": b.description,
            "earned_at": b.earned_at.isoformat(),
        }
        for b in badges
    ]

    # Weekly activity (last 7 days)
    today = date.today()
    weekly = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = db.query(LearningActivity).filter(
            LearningActivity.user_id == user_id,
            func.date(LearningActivity.created_at) == d,
        ).count()
        weekly.append({
            "date": d.isoformat(),
            "day": d.strftime("%a"),
            "count": count,
        })

    return ProgressResponse(
        total_xp=current_user.xp,
        streak_count=current_user.streak_count,
        total_questions=total_questions,
        quizzes_completed=len(quizzes),
        quiz_average=round(quiz_avg, 1),
        topics_completed=completed_paths,
        total_learning_hours=estimated_hours,
        strong_topics=strong_topics,
        weak_topics=weak_topics,
        recent_activity=recent_list,
        badges=badge_list,
        weekly_activity=weekly,
    )


@router.get("/activity", response_model=list[ActivityResponse])
def get_activity(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    activity_type: str = Query(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get learning activity history with pagination."""
    query = db.query(LearningActivity).filter(
        LearningActivity.user_id == current_user.id,
    )

    if activity_type:
        query = query.filter(LearningActivity.activity_type == activity_type)

    activities = query.order_by(
        LearningActivity.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    return [ActivityResponse.model_validate(a) for a in activities]


@router.get("/badges", response_model=list[BadgeResponse])
def get_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all earned badges."""
    badges = db.query(Badge).filter(
        Badge.user_id == current_user.id
    ).order_by(Badge.earned_at.desc()).all()

    return [BadgeResponse.model_validate(b) for b in badges]


@router.get("/streak")
def get_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current learning streak details."""
    today = date.today()
    calendar = []

    for i in range(27, -1, -1):  # Last 28 days (4 weeks)
        d = today - timedelta(days=i)
        has_activity = db.query(LearningActivity).filter(
            LearningActivity.user_id == current_user.id,
            func.date(LearningActivity.created_at) == d,
        ).count() > 0
        calendar.append({
            "date": d.isoformat(),
            "day": d.strftime("%a"),
            "active": has_activity,
        })

    return {
        "streak_count": current_user.streak_count,
        "calendar": calendar,
        "last_active": current_user.last_active_date.isoformat() if current_user.last_active_date else None,
    }


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard summary data."""
    user_id = current_user.id

    # Quiz stats
    quizzes = db.query(Quiz).filter(
        Quiz.user_id == user_id,
        Quiz.completed == True,
    ).all()
    quiz_avg = 0.0
    if quizzes:
        scores = [(q.score / q.total * 100) for q in quizzes if q.total > 0]
        quiz_avg = sum(scores) / len(scores) if scores else 0

    # Total questions asked
    qa_count = db.query(LearningActivity).filter(
        LearningActivity.user_id == user_id,
        LearningActivity.activity_type == "qa",
    ).count()

    # Active learning paths
    active_paths = db.query(LearningPath).filter(
        LearningPath.user_id == user_id,
        LearningPath.progress < 100,
    ).order_by(LearningPath.updated_at.desc()).limit(3).all()

    paths_data = [
        {
            "id": p.id,
            "topic": p.topic,
            "progress": p.progress,
            "level": p.level,
        }
        for p in active_paths
    ]

    # Recent activity
    recent = db.query(LearningActivity).filter(
        LearningActivity.user_id == user_id,
    ).order_by(LearningActivity.created_at.desc()).limit(5).all()

    recent_list = [
        {
            "type": a.activity_type,
            "topic": a.topic,
            "details": a.details,
            "xp": a.xp_earned,
            "created_at": a.created_at.isoformat(),
        }
        for a in recent
    ]

    # Topic performances for weak areas
    weak_topics = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == user_id,
        TopicPerformance.average_score < 70,
    ).all()

    weak_list = [
        {"topic": tp.topic, "score": round(tp.average_score, 1)}
        for tp in weak_topics
    ]

    # Determine greeting based on time
    hour = datetime.now().hour
    if hour < 12:
        greeting = "Good morning"
    elif hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"

    return {
        "greeting": greeting,
        "user_name": current_user.name,
        "xp": current_user.xp,
        "streak": current_user.streak_count,
        "quiz_average": round(quiz_avg, 1),
        "questions_asked": qa_count,
        "quizzes_completed": len(quizzes),
        "active_paths": paths_data,
        "recent_activity": recent_list,
        "weak_topics": weak_list,
        "interests": current_user.interests or [],
    }

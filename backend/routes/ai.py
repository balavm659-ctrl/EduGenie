"""
EduGenie AI Routes
Core AI endpoints: Q&A, Explain, Quiz, Summarize, Learning Path, Recommendations.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    User, Conversation, Message, Quiz,
    LearningPath, LearningActivity, TopicPerformance, Badge,
)
from ..schemas import (
    QARequest, QAResponse,
    ExplainRequest, ExplainResponse,
    QuizRequest, QuizGenerateResponse, QuizSubmitRequest, QuizResultResponse, QuizQuestion,
    SummarizeRequest, SummarizeResponse,
    LearningPathRequest, LearningPathResponse,
    RecommendationResponse,
)
from ..services.auth_service import get_current_user
from ..services.gemini_service import (
    generate_answer, explain_concept, generate_quiz,
    summarize_text, generate_learning_path,
    generate_recommendations, generate_title,
)
from ..config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/api", tags=["AI"])


def _award_xp(db: Session, user: User, amount: int):
    """Award XP to user and check for badge milestones."""
    user.xp += amount
    db.commit()


def _log_activity(db: Session, user_id: int, activity_type: str, topic: str, details: str = "", xp: int = 0):
    """Log a learning activity."""
    activity = LearningActivity(
        user_id=user_id,
        activity_type=activity_type,
        topic=topic,
        details=details,
        xp_earned=xp,
    )
    db.add(activity)
    db.commit()


def _check_badges(db: Session, user: User):
    """Check and award badges based on user's activity."""
    existing = {b.badge_type for b in user.badges}
    new_badges = []

    # Total questions asked
    qa_count = db.query(LearningActivity).filter(
        LearningActivity.user_id == user.id,
        LearningActivity.activity_type == "qa"
    ).count()
    if qa_count >= 1 and "first_question" not in existing:
        new_badges.append(("first_question", "First Question", "Asked your first question!"))
    if qa_count >= 50 and "knowledge_seeker" not in existing:
        new_badges.append(("knowledge_seeker", "Knowledge Seeker", "Asked 50 questions!"))

    # Quiz badges
    quiz_count = db.query(Quiz).filter(
        Quiz.user_id == user.id,
        Quiz.completed == True
    ).count()
    if quiz_count >= 1 and "quiz_starter" not in existing:
        new_badges.append(("quiz_starter", "Quiz Starter", "Completed your first quiz!"))
    if quiz_count >= 10 and "quiz_master" not in existing:
        new_badges.append(("quiz_master", "Quiz Master", "Completed 10 quizzes!"))

    # Perfect quiz
    perfect_count = db.query(Quiz).filter(
        Quiz.user_id == user.id,
        Quiz.completed == True,
        Quiz.score == Quiz.total
    ).count()
    if perfect_count >= 1 and "perfect_score" not in existing:
        new_badges.append(("perfect_score", "Perfect Score", "Got 100% on a quiz!"))

    # Streak badges
    if user.streak_count >= 7 and "7_day_learner" not in existing:
        new_badges.append(("7_day_learner", "7 Day Learner", "Maintained a 7-day learning streak!"))
    if user.streak_count >= 30 and "consistent_learner" not in existing:
        new_badges.append(("consistent_learner", "Consistent Learner", "30-day learning streak!"))

    for badge_type, name, desc in new_badges:
        badge = Badge(
            user_id=user.id,
            badge_type=badge_type,
            badge_name=name,
            description=desc,
        )
        db.add(badge)
    if new_badges:
        db.commit()


# ──────────────────────── Q&A ────────────────────────

@router.post("/qa", response_model=QAResponse)
def ask_question(
    req: QARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ask a question and get an AI-powered answer."""
    try:
        language = req.language or current_user.preferred_language

        # Get or create conversation
        conversation = None
        history = []
        if req.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == req.conversation_id,
                Conversation.user_id == current_user.id,
            ).first()
            if conversation:
                messages = conversation.messages[-6:]
                history = [{"role": m.role, "content": m.content} for m in messages]

        if not conversation:
            title = generate_title(req.question)
            conversation = Conversation(
                user_id=current_user.id,
                title=title,
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=req.question,
        )
        db.add(user_msg)
        db.commit()

        # Generate answer
        answer = generate_answer(
            question=req.question,
            history=history,
            level=current_user.current_level,
            education_level=current_user.education_level,
            interests=current_user.interests,
            language=language,
        )

        # Save AI response
        ai_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=answer,
        )
        db.add(ai_msg)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()

        # Award XP and log activity
        _award_xp(db, current_user, settings.XP_QUESTION)
        _log_activity(db, current_user.id, "qa", req.question[:100], xp=settings.XP_QUESTION)
        _check_badges(db, current_user)

        db.commit()
        db.refresh(ai_msg)

        return QAResponse(
            answer=answer,
            conversation_id=conversation.id,
            message_id=ai_msg.id,
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Q&A error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer. Please try again.")


# ──────────────────────── Concept Explanation ────────────────────────

@router.post("/explain", response_model=ExplainResponse)
def explain(
    req: ExplainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a structured concept explanation."""
    try:
        language = req.language or current_user.preferred_language

        explanation = explain_concept(
            concept=req.concept,
            difficulty=req.difficulty,
            style=req.style,
            language=language,
        )

        # Award XP and log
        _award_xp(db, current_user, settings.XP_EXPLANATION)
        _log_activity(db, current_user.id, "explain", req.concept, xp=settings.XP_EXPLANATION)
        _check_badges(db, current_user)

        return ExplainResponse(
            explanation=explanation,
            concept=req.concept,
            difficulty=req.difficulty,
            style=req.style,
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Explain error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate explanation. Please try again.")


# ──────────────────────── Quiz ────────────────────────

@router.post("/quiz", response_model=QuizGenerateResponse)
def create_quiz(
    req: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a quiz on a topic."""
    try:
        language = req.language or current_user.preferred_language

        questions = generate_quiz(
            topic=req.topic,
            num_questions=req.num_questions,
            difficulty=req.difficulty,
            language=language,
        )

        # Save quiz to database
        quiz = Quiz(
            user_id=current_user.id,
            topic=req.topic,
            difficulty=req.difficulty,
            num_questions=len(questions),
            questions=questions,
            total=len(questions),
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return QuizGenerateResponse(
            quiz_id=quiz.id,
            topic=req.topic,
            difficulty=req.difficulty,
            num_questions=len(questions),
            questions=[QuizQuestion(**q) for q in questions],
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz. Please try again.")


@router.post("/quiz/submit", response_model=QuizResultResponse)
def submit_quiz(
    req: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit quiz answers and get results."""
    quiz = db.query(Quiz).filter(
        Quiz.id == req.quiz_id,
        Quiz.user_id == current_user.id,
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if quiz.completed:
        raise HTTPException(status_code=400, detail="Quiz already submitted")

    questions = quiz.questions
    if len(req.answers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(questions)} answers, got {len(req.answers)}",
        )

    # Calculate score
    correct = []
    wrong = []
    for i, (q, ans) in enumerate(zip(questions, req.answers)):
        if ans.upper() == q["correct_answer"]:
            correct.append(i)
        else:
            wrong.append(i)

    score = len(correct)
    total = len(questions)
    percentage = (score / total) * 100 if total > 0 else 0

    # Update quiz record
    quiz.score = score
    quiz.user_answers = req.answers
    quiz.time_taken = req.time_taken
    quiz.completed = True
    quiz.completed_at = datetime.utcnow()

    # Update topic performance
    topic_perf = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == current_user.id,
        TopicPerformance.topic == quiz.topic,
    ).first()

    if topic_perf:
        topic_perf.total_questions += total
        topic_perf.correct_answers += score
        topic_perf.attempts += 1
        topic_perf.average_score = (topic_perf.correct_answers / topic_perf.total_questions) * 100
        topic_perf.last_attempted = datetime.utcnow()
    else:
        topic_perf = TopicPerformance(
            user_id=current_user.id,
            topic=quiz.topic,
            total_questions=total,
            correct_answers=score,
            average_score=percentage,
            attempts=1,
        )
        db.add(topic_perf)

    # Award XP
    xp = settings.XP_QUIZ_COMPLETE
    if score == total:
        xp = settings.XP_QUIZ_PERFECT
    _award_xp(db, current_user, xp)
    _log_activity(db, current_user.id, "quiz", quiz.topic,
                  details=f"Score: {score}/{total} ({percentage:.0f}%)", xp=xp)
    _check_badges(db, current_user)

    db.commit()

    # Determine weak areas and recommendations
    weak_areas = []
    recommendations = []
    if percentage < 70:
        weak_areas.append(quiz.topic)
        recommendations.append(f"Review the concept of {quiz.topic}")
        recommendations.append(f"Try the explanation module for {quiz.topic}")
        recommendations.append("Attempt an easier quiz on the same topic")

    return QuizResultResponse(
        quiz_id=quiz.id,
        topic=quiz.topic,
        score=score,
        total=total,
        percentage=round(percentage, 1),
        time_taken=req.time_taken,
        correct_answers=correct,
        wrong_answers=wrong,
        questions=[QuizQuestion(**q) for q in questions],
        user_answers=req.answers,
        weak_areas=weak_areas,
        recommendations=recommendations,
    )


@router.get("/quiz/{quiz_id}")
def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific quiz by ID."""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id,
    ).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {
        "id": quiz.id,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "num_questions": quiz.num_questions,
        "questions": quiz.questions,
        "score": quiz.score,
        "total": quiz.total,
        "user_answers": quiz.user_answers,
        "time_taken": quiz.time_taken,
        "completed": quiz.completed,
        "created_at": quiz.created_at.isoformat(),
        "completed_at": quiz.completed_at.isoformat() if quiz.completed_at else None,
    }


# ──────────────────────── Summarization ────────────────────────

@router.post("/summarize", response_model=SummarizeResponse)
def summarize(
    req: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Summarize educational content."""
    try:
        language = req.language or current_user.preferred_language

        result = summarize_text(
            text=req.text,
            length=req.length,
            language=language,
        )

        # Parse structured response
        # Extract sections from the markdown response
        summary_text = result
        key_points = []
        important_terms = []
        revision_notes = ""
        one_minute = ""

        sections = result.split("## ")
        for section in sections:
            lower = section.lower()
            if "key point" in lower:
                lines = section.strip().split("\n")
                key_points = [l.strip().lstrip("- •").strip() for l in lines[1:] if l.strip().startswith(("-", "•", "*"))]
            elif "important term" in lower:
                lines = section.strip().split("\n")
                important_terms = [l.strip().lstrip("- •").strip() for l in lines[1:] if l.strip().startswith(("-", "•", "*"))]
            elif "exam revision" in lower or "revision note" in lower:
                lines = section.strip().split("\n")
                revision_notes = "\n".join(lines[1:]).strip()
            elif "one-minute" in lower or "one minute" in lower:
                lines = section.strip().split("\n")
                one_minute = "\n".join(lines[1:]).strip()
            elif "summary" in lower and not key_points:
                lines = section.strip().split("\n")
                summary_text = "\n".join(lines[1:]).strip()

        _award_xp(db, current_user, settings.XP_SUMMARY)
        _log_activity(db, current_user.id, "summary", "Content Summary", xp=settings.XP_SUMMARY)

        return SummarizeResponse(
            summary=summary_text if summary_text != result else result,
            key_points=key_points[:10] if key_points else ["See the summary above for key information"],
            important_terms=important_terms[:10] if important_terms else [],
            revision_notes=revision_notes or "See summary for revision content",
            one_minute_revision=one_minute or summary_text[:300] if summary_text != result else result[:300],
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Summarize error: {e}")
        raise HTTPException(status_code=500, detail="Failed to summarize content. Please try again.")


@router.post("/summarize/upload")
async def summarize_upload(
    file: UploadFile = File(...),
    length: str = Form(default="medium"),
    language: str = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a file and summarize its content."""
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext} not supported. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Read file content
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    text = ""
    if ext == ".txt":
        text = content.decode("utf-8", errors="ignore")
    elif ext == ".pdf":
        try:
            import io
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the file")

    # Use the summarize logic
    lang = language or current_user.preferred_language
    try:
        result = summarize_text(text=text, length=length, language=lang)
        _award_xp(db, current_user, settings.XP_SUMMARY)
        _log_activity(db, current_user.id, "summary", f"File: {file.filename}", xp=settings.XP_SUMMARY)

        return {
            "summary": result,
            "filename": file.filename,
            "text_length": len(text),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ──────────────────────── Learning Path ────────────────────────

@router.post("/learn/path", response_model=LearningPathResponse)
def create_learning_path(
    req: LearningPathRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized learning path."""
    try:
        language = req.language or current_user.preferred_language

        weeks = generate_learning_path(
            topic=req.topic,
            level=req.current_level,
            goal=req.goal,
            hours_per_day=req.hours_per_day,
            duration=req.duration,
            language=language,
        )

        # Save to database
        path = LearningPath(
            user_id=current_user.id,
            topic=req.topic,
            level=req.current_level,
            goal=req.goal,
            duration=req.duration,
            hours_per_day=req.hours_per_day,
            content=weeks,
        )
        db.add(path)

        _award_xp(db, current_user, settings.XP_LEARNING_PATH_MILESTONE)
        _log_activity(db, current_user.id, "learning_path", req.topic,
                      details=f"Created learning path for {req.topic}", xp=settings.XP_LEARNING_PATH_MILESTONE)
        _check_badges(db, current_user)

        db.commit()
        db.refresh(path)

        # Count total topics
        total_topics = sum(len(w.get("topics", [])) for w in weeks)

        return LearningPathResponse(
            path_id=path.id,
            topic=req.topic,
            level=req.current_level,
            duration=req.duration,
            weeks=weeks,
            total_topics=total_topics,
        )

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Learning path error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learning path. Please try again.")


@router.get("/learn/paths")
def get_learning_paths(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all learning paths for the current user."""
    paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "topic": p.topic,
            "level": p.level,
            "goal": p.goal,
            "duration": p.duration,
            "progress": p.progress,
            "created_at": p.created_at.isoformat(),
        }
        for p in paths
    ]


@router.get("/learn/path/{path_id}")
def get_learning_path_detail(
    path_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed learning path."""
    path = db.query(LearningPath).filter(
        LearningPath.id == path_id,
        LearningPath.user_id == current_user.id,
    ).first()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")

    return {
        "id": path.id,
        "topic": path.topic,
        "level": path.level,
        "goal": path.goal,
        "duration": path.duration,
        "hours_per_day": path.hours_per_day,
        "progress": path.progress,
        "content": path.content,
        "completed_items": path.completed_items,
        "created_at": path.created_at.isoformat(),
    }


@router.put("/learn/path/{path_id}/progress")
def update_learning_path_progress(
    path_id: int,
    progress: float,
    completed_item: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update learning path progress."""
    path = db.query(LearningPath).filter(
        LearningPath.id == path_id,
        LearningPath.user_id == current_user.id,
    ).first()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")

    path.progress = min(100.0, max(0.0, progress))
    if completed_item:
        items = path.completed_items or []
        if completed_item not in items:
            items.append(completed_item)
            path.completed_items = items

    path.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Progress updated", "progress": path.progress}


# ──────────────────────── Recommendations ────────────────────────

@router.get("/learn/recommendations")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized learning recommendations."""
    # Get topic performance data
    performances = db.query(TopicPerformance).filter(
        TopicPerformance.user_id == current_user.id
    ).all()

    strong = [p.topic for p in performances if p.average_score >= 70]
    weak = [p.topic for p in performances if p.average_score < 70]

    # Get recent activities
    recent = db.query(LearningActivity).filter(
        LearningActivity.user_id == current_user.id
    ).order_by(LearningActivity.created_at.desc()).limit(10).all()
    recent_topics = list(set(a.topic for a in recent if a.topic))

    # Calculate quiz average
    quizzes = db.query(Quiz).filter(
        Quiz.user_id == current_user.id,
        Quiz.completed == True,
    ).all()
    quiz_avg = 0.0
    if quizzes:
        quiz_avg = sum((q.score / q.total * 100) for q in quizzes if q.total > 0) / len(quizzes)

    try:
        result = generate_recommendations(
            name=current_user.name,
            level=current_user.current_level,
            interests=current_user.interests or [],
            learning_style=current_user.learning_style,
            strong_topics=strong,
            weak_topics=weak,
            recent_activities=recent_topics,
            quiz_average=quiz_avg,
            language=current_user.preferred_language,
        )

        # Enrich with actual weak topic data
        weak_topic_data = [
            {"topic": p.topic, "score": round(p.average_score, 1), "attempts": p.attempts}
            for p in performances if p.average_score < 70
        ]

        return {
            "recommendations": result.get("recommendations", []),
            "weak_topics": weak_topic_data,
            "suggested_quizzes": result.get("suggested_quizzes", []),
            "next_steps": result.get("next_steps", []),
            "motivational_message": result.get("motivational_message", "Keep learning!"),
        }

    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return {
            "recommendations": [],
            "weak_topics": [
                {"topic": p.topic, "score": round(p.average_score, 1), "attempts": p.attempts}
                for p in performances if p.average_score < 70
            ],
            "suggested_quizzes": current_user.interests[:3] if current_user.interests else [],
            "next_steps": ["Ask EduGenie a question to start learning"],
            "motivational_message": "Every expert was once a beginner. Keep going!",
        }

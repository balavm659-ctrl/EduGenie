"""
EduGenie Gemini Service
Centralized Google Gemini API communication layer.
All AI interactions go through this service.
"""

import json
import logging
import re
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from ..config import get_settings
from ..utils.prompts import (
    QA_SYSTEM_PROMPT, QA_FOLLOWUP_PROMPT,
    EXPLAIN_PROMPT,
    QUIZ_PROMPT,
    SUMMARIZE_PROMPT, get_summary_length_instruction,
    LEARNING_PATH_PROMPT,
    RECOMMENDATION_PROMPT,
    TITLE_PROMPT,
    get_language_instruction,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
]

GENERATION_CONFIG = genai.GenerationConfig(
    temperature=0.7,
    top_p=0.9,
    top_k=40,
    max_output_tokens=4096,
)

QUIZ_GENERATION_CONFIG = genai.GenerationConfig(
    temperature=0.4,
    top_p=0.8,
    top_k=30,
    max_output_tokens=8192,
)


def _get_model(config=None):
    """Get a Gemini GenerativeModel instance."""
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured. Please set it in your .env file.")
    return genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        generation_config=config or GENERATION_CONFIG,
        safety_settings=SAFETY_SETTINGS,
    )


def _extract_json(text: str) -> Any:
    """Extract JSON from AI response, handling markdown code blocks."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', text)
    if json_match:
        text = json_match.group(1)

    # Clean up the text
    text = text.strip()

    # Try parsing
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find array or object pattern
        arr_match = re.search(r'(\[[\s\S]*\])', text)
        if arr_match:
            try:
                return json.loads(arr_match.group(1))
            except json.JSONDecodeError:
                pass
        obj_match = re.search(r'(\{[\s\S]*\})', text)
        if obj_match:
            try:
                return json.loads(obj_match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse JSON from AI response")


def _safe_generate(model, prompt: str, fallback: str = "I'm sorry, I couldn't generate a response right now. Please try again.") -> str:
    """Safely generate content with error handling."""
    try:
        response = model.generate_content(prompt)
        if response and response.text:
            return response.text
        return fallback
    except Exception as e:
        error_str = str(e).lower()
        error_msg = str(e)

        # Differentiate error types for accurate reporting
        if "401" in error_str or "403" in error_str or "permission" in error_str:
            logger.error(f"Gemini API authentication/permission error: {error_msg}")
            raise RuntimeError(f"API key or permission issue: {error_msg}")
        elif "404" in error_str or "not found" in error_str or "no longer available" in error_str:
            logger.error(f"Gemini API model not found: {error_msg}")
            raise RuntimeError(f"Model not available (404). Check GEMINI_MODEL in .env: {error_msg}")
        elif "429" in error_str or "quota" in error_str or "rate" in error_str:
            logger.error(f"Gemini API rate limit/quota error: {error_msg}")
            raise RuntimeError(f"API rate limit or quota exceeded. Please wait and try again: {error_msg}")
        elif "500" in error_str or "503" in error_str or "internal" in error_str:
            logger.error(f"Gemini API server error: {error_msg}")
            raise RuntimeError(f"Gemini server error. Please try again later: {error_msg}")
        else:
            logger.error(f"Gemini API error: {error_msg}")
            raise RuntimeError(f"AI generation failed: {error_msg}")


# ──────────────────────── Q&A ────────────────────────

def generate_answer(
    question: str,
    history: Optional[List[Dict[str, str]]] = None,
    level: str = "beginner",
    education_level: str = "",
    interests: Optional[List[str]] = None,
    language: str = "english",
) -> str:
    """Generate an educational answer to a student's question."""
    model = _get_model()
    language_instruction = get_language_instruction(language)

    system_prompt = QA_SYSTEM_PROMPT.format(
        level=level,
        language_instruction=language_instruction,
        education_level=education_level or "Not specified",
        interests=", ".join(interests) if interests else "General",
    )

    if history and len(history) > 0:
        # Format conversation history
        history_text = "\n".join(
            [f"{'Student' if m['role'] == 'user' else 'EduGenie'}: {m['content']}"
             for m in history[-6:]]  # Last 6 messages for context
        )
        prompt = system_prompt + "\n\n" + QA_FOLLOWUP_PROMPT.format(
            history=history_text,
            question=question,
        )
    else:
        prompt = system_prompt + f"\n\nStudent's question: {question}\n\nProvide a helpful, educational response."

    return _safe_generate(model, prompt)


# ──────────────────────── Concept Explanation ────────────────────────

def explain_concept(
    concept: str,
    difficulty: str = "beginner",
    style: str = "simple",
    language: str = "english",
) -> str:
    """Generate a structured concept explanation."""
    model = _get_model()
    language_instruction = get_language_instruction(language)

    prompt = EXPLAIN_PROMPT.format(
        concept=concept,
        difficulty=difficulty,
        style=style,
        language_instruction=language_instruction,
    )

    return _safe_generate(model, prompt)


# ──────────────────────── Quiz Generation ────────────────────────

def generate_quiz(
    topic: str,
    num_questions: int = 10,
    difficulty: str = "medium",
    language: str = "english",
) -> List[Dict[str, Any]]:
    """Generate a quiz with validated JSON structure."""
    model = _get_model(config=QUIZ_GENERATION_CONFIG)
    language_instruction = get_language_instruction(language)

    prompt = QUIZ_PROMPT.format(
        topic=topic,
        num_questions=num_questions,
        difficulty=difficulty,
        language_instruction=language_instruction,
    )

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response_text = _safe_generate(model, prompt)
            questions = _extract_json(response_text)

            if not isinstance(questions, list):
                raise ValueError("Expected a JSON array of questions")

            # Validate each question
            validated = []
            for i, q in enumerate(questions):
                if not all(k in q for k in ("question", "options", "correct_answer", "explanation")):
                    logger.warning(f"Skipping invalid question at index {i}")
                    continue

                # Ensure options has A, B, C, D
                opts = q["options"]
                if not all(k in opts for k in ("A", "B", "C", "D")):
                    logger.warning(f"Skipping question with missing options at index {i}")
                    continue

                # Ensure correct_answer is valid
                if q["correct_answer"] not in ("A", "B", "C", "D"):
                    q["correct_answer"] = "A"

                validated.append({
                    "question": str(q["question"]),
                    "options": {
                        "A": str(opts["A"]),
                        "B": str(opts["B"]),
                        "C": str(opts["C"]),
                        "D": str(opts["D"]),
                    },
                    "correct_answer": str(q["correct_answer"]),
                    "explanation": str(q.get("explanation", "No explanation provided.")),
                })

            if len(validated) < 3:
                raise ValueError(f"Only {len(validated)} valid questions generated, need at least 3")

            return validated[:num_questions]

        except (ValueError, json.JSONDecodeError) as e:
            if attempt < max_retries:
                logger.warning(f"Quiz generation attempt {attempt + 1} failed: {e}. Retrying...")
                continue
            raise RuntimeError(f"Failed to generate valid quiz after {max_retries + 1} attempts: {e}")


# ──────────────────────── Summarization ────────────────────────

def summarize_text(
    text: str,
    length: str = "medium",
    language: str = "english",
) -> str:
    """Summarize educational content."""
    model = _get_model()
    language_instruction = get_language_instruction(language)
    length_instruction = get_summary_length_instruction(length)

    prompt = SUMMARIZE_PROMPT.format(
        text=text,
        length=length,
        language_instruction=language_instruction,
        length_instruction=length_instruction,
    )

    return _safe_generate(model, prompt)


# ──────────────────────── Learning Path ────────────────────────

def generate_learning_path(
    topic: str,
    level: str = "beginner",
    goal: str = "",
    hours_per_day: float = 1.0,
    duration: str = "4 weeks",
    language: str = "english",
) -> List[Dict[str, Any]]:
    """Generate a structured learning path."""
    model = _get_model(config=QUIZ_GENERATION_CONFIG)
    language_instruction = get_language_instruction(language)

    prompt = LEARNING_PATH_PROMPT.format(
        topic=topic,
        level=level,
        goal=goal or f"Master {topic}",
        hours_per_day=hours_per_day,
        duration=duration,
        language_instruction=language_instruction,
    )

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response_text = _safe_generate(model, prompt)
            weeks = _extract_json(response_text)

            if not isinstance(weeks, list):
                raise ValueError("Expected a JSON array of weeks")

            validated = []
            for w in weeks:
                validated.append({
                    "week": int(w.get("week", len(validated) + 1)),
                    "title": str(w.get("title", f"Week {len(validated) + 1}")),
                    "topics": w.get("topics", []),
                    "practice_task": str(w.get("practice_task", "Practice the covered topics")),
                    "quiz_topic": str(w.get("quiz_topic", "")),
                })

            if not validated:
                raise ValueError("No valid weeks generated")

            return validated

        except (ValueError, json.JSONDecodeError) as e:
            if attempt < max_retries:
                logger.warning(f"Learning path attempt {attempt + 1} failed: {e}. Retrying...")
                continue
            raise RuntimeError(f"Failed to generate learning path: {e}")


# ──────────────────────── Recommendations ────────────────────────

def generate_recommendations(
    name: str,
    level: str,
    interests: List[str],
    learning_style: str,
    strong_topics: List[str],
    weak_topics: List[str],
    recent_activities: List[str],
    quiz_average: float,
    language: str = "english",
) -> Dict[str, Any]:
    """Generate personalized learning recommendations."""
    model = _get_model()
    language_instruction = get_language_instruction(language)

    prompt = RECOMMENDATION_PROMPT.format(
        name=name,
        level=level,
        interests=", ".join(interests) if interests else "Not specified",
        learning_style=learning_style,
        strong_topics=", ".join(strong_topics) if strong_topics else "None yet",
        weak_topics=", ".join(weak_topics) if weak_topics else "None identified",
        recent_activities=", ".join(recent_activities) if recent_activities else "None",
        quiz_average=round(quiz_average, 1),
        language_instruction=language_instruction,
    )

    try:
        response_text = _safe_generate(model, prompt)
        result = _extract_json(response_text)
        if isinstance(result, dict):
            return result
        return {
            "recommendations": [],
            "next_steps": ["Start by asking EduGenie a question about your topic of interest"],
            "suggested_quizzes": interests[:3] if interests else [],
            "motivational_message": "Every expert was once a beginner. Keep learning!"
        }
    except Exception as e:
        logger.error(f"Recommendation generation failed: {e}")
        return {
            "recommendations": [],
            "next_steps": ["Start by asking EduGenie a question"],
            "suggested_quizzes": [],
            "motivational_message": "Keep learning and growing!"
        }


# ──────────────────────── Conversation Title ────────────────────────

def generate_title(message: str) -> str:
    """Generate a short title for a conversation."""
    try:
        model = _get_model(config=genai.GenerationConfig(
            temperature=0.3,
            max_output_tokens=30,
        ))
        prompt = TITLE_PROMPT.format(message=message[:200])
        title = _safe_generate(model, prompt, fallback="New Chat")
        return title.strip().strip('"\'')[:100]
    except Exception:
        # Fallback: use first few words of the message
        words = message.split()[:5]
        return " ".join(words) + ("..." if len(message.split()) > 5 else "")

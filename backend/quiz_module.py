"""
EduGenie Legacy Compatibility Module: Quiz Generator
Provides standalone backwards-compatible function for generating validated multiple choice quizzes.
"""

from typing import List, Dict, Any
from .services.gemini_service import generate_quiz


def create_quiz(topic: str, num_questions: int = 10, difficulty: str = "medium", language: str = "english") -> List[Dict[str, Any]]:
    """Generates structured, validated MCQ questions."""
    return generate_quiz(topic=topic, num_questions=num_questions, difficulty=difficulty, language=language)


if __name__ == "__main__":
    import sys
    import json
    t = sys.argv[1] if len(sys.argv) > 1 else "Python Loops"
    print(f"--- Generating Quiz on {t} ---")
    quiz = create_quiz(t, num_questions=3)
    print(json.dumps(quiz, indent=2))

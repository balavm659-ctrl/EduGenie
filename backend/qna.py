"""
EduGenie Legacy Compatibility Module: Q&A
Provides standalone backwards-compatible function for academic Q&A.
"""

from typing import Optional, List, Dict
from .services.gemini_service import generate_answer


def answer_question(
    question: str,
    history: Optional[List[Dict[str, str]]] = None,
    level: str = "beginner",
    language: str = "english"
) -> str:
    """Answers an academic question adapting to student level."""
    return generate_answer(question=question, history=history, level=level, language=language)


if __name__ == "__main__":
    import sys
    q = sys.argv[1] if len(sys.argv) > 1 else "What is polymorphism?"
    print(f"--- Question: {q} ---")
    print(answer_question(q))

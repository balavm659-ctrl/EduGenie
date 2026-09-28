"""
EduGenie Legacy Compatibility Module: Explanation
Provides standalone backwards-compatible function for concept explanation.
"""

from .services.gemini_service import explain_concept


def get_explanation(concept: str, difficulty: str = "beginner", style: str = "simple", language: str = "english") -> str:
    """Explains a concept with structured pedagogical output."""
    return explain_concept(concept=concept, difficulty=difficulty, style=style, language=language)


if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "Recursion"
    print(f"--- Explaining {topic} ---")
    print(get_explanation(topic))

"""
EduGenie Legacy Compatibility Module: Learning Path
Provides standalone backwards-compatible function for generating structured learning paths.
"""

from typing import List, Dict, Any
from .services.gemini_service import generate_learning_path


def build_learning_path(
    topic: str,
    level: str = "beginner",
    goal: str = "",
    hours_per_day: float = 1.0,
    duration: str = "4 weeks",
    language: str = "english"
) -> List[Dict[str, Any]]:
    """Builds a progressive curriculum roadmap from beginner to advanced."""
    return generate_learning_path(
        topic=topic,
        level=level,
        goal=goal,
        hours_per_day=hours_per_day,
        duration=duration,
        language=language
    )


if __name__ == "__main__":
    import sys
    import json
    t = sys.argv[1] if len(sys.argv) > 1 else "Machine Learning"
    print(f"--- Learning Path for {t} ---")
    path = build_learning_path(t, duration="2 weeks")
    print(json.dumps(path, indent=2))

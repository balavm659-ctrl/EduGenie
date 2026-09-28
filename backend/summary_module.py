"""
EduGenie Legacy Compatibility Module: Summarizer
Provides standalone backwards-compatible function for educational text summarization.
"""

from .services.gemini_service import summarize_text


def summarize(text: str, length: str = "medium", language: str = "english") -> str:
    """Summarizes educational material extracting key points, terms, and exam revision."""
    return summarize_text(text=text, length=length, language=language)


if __name__ == "__main__":
    sample = (
        "Operating System scheduling algorithms manage CPU execution time among runnable processes. "
        "Common algorithms include First-Come First-Served (FCFS), Shortest Job First (SJF), "
        "Round Robin (RR) with time slicing, and Priority Scheduling. Preemption allows the OS to "
        "interrupt currently running processes to allocate CPU to higher priority tasks."
    )
    print("--- Summarizing Operating Systems ---")
    print(summarize(sample))

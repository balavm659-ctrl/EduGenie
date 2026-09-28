"""
EduGenie Demo Data Seeder
Populates initial sample student data, quizzes, learning paths, and progress for evaluation.
"""

from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from ..models import User, Conversation, Message, Quiz, LearningPath, LearningActivity, SavedItem, Badge, TopicPerformance
from ..services.auth_service import hash_password


def seed_demo_data(db: Session):
    """Seed demo student with realistic educational progress and activities."""
    demo_email = "student@edugenie.demo"
    existing = db.query(User).filter(User.email == demo_email).first()
    if existing:
        return existing

    # Create demo student
    demo_user = User(
        name="Demo Student",
        email=demo_email,
        password_hash=hash_password("DemoPass123!"),
        education_level="Undergraduate B.Tech CSE",
        current_level="intermediate",
        preferred_language="english",
        learning_style="mixed",
        interests=["Python", "SQL", "AI/ML", "Cloud Computing"],
        onboarding_completed=True,
        xp=420,
        streak_count=7,
        last_active_date=date.today(),
        theme="light",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 1. Add Badges
    badges = [
        Badge(user_id=demo_user.id, badge_type="first_question", badge_name="First Question", description="Asked your first question!"),
        Badge(user_id=demo_user.id, badge_type="quiz_starter", badge_name="Quiz Starter", description="Completed your first quiz!"),
        Badge(user_id=demo_user.id, badge_type="7_day_learner", badge_name="7 Day Learner", description="Maintained a 7-day learning streak!"),
        Badge(user_id=demo_user.id, badge_type="perfect_score", badge_name="Perfect Score", description="Got 100% on a quiz!"),
    ]
    db.add_all(badges)

    # 2. Add Topic Performances (Showing strength in Python basics and weakness in Recursion)
    tp_python = TopicPerformance(
        user_id=demo_user.id,
        topic="Python Fundamentals",
        total_questions=20,
        correct_answers=18,
        average_score=90.0,
        attempts=2,
    )
    tp_sql = TopicPerformance(
        user_id=demo_user.id,
        topic="SQL Fundamentals",
        total_questions=15,
        correct_answers=13,
        average_score=86.7,
        attempts=2,
    )
    tp_recursion = TopicPerformance(
        user_id=demo_user.id,
        topic="Recursion & Call Stack",
        total_questions=10,
        correct_answers=4,
        average_score=40.0,
        attempts=1,
    )
    tp_oop = TopicPerformance(
        user_id=demo_user.id,
        topic="Object-Oriented Programming",
        total_questions=10,
        correct_answers=6,
        average_score=60.0,
        attempts=1,
    )
    db.add_all([tp_python, tp_sql, tp_recursion, tp_oop])

    # 3. Add Conversations
    conv1 = Conversation(user_id=demo_user.id, title="Polymorphism & OOP Concepts")
    db.add(conv1)
    db.commit()
    db.refresh(conv1)

    m1 = Message(
        conversation_id=conv1.id,
        role="user",
        content="What is polymorphism and how does method overriding work in Python?",
        created_at=datetime.utcnow() - timedelta(days=2),
    )
    m2 = Message(
        conversation_id=conv1.id,
        role="assistant",
        content="""### 🧬 Understanding Polymorphism in Python

**Polymorphism** means *"many forms"*. In programming, it allows entities such as functions or objects to behave differently depending on the context.

#### 1. Method Overriding
Method overriding occurs when a child class provides a specific implementation of a method that is already defined in its parent class.

```python
class Animal:
    def make_sound(self):
        return "Some generic sound"

class Dog(Animal):
    def make_sound(self):
        return "Woof! Woof!"

class Cat(Animal):
    def make_sound(self):
        return "Meow!"

# Demonstrating Polymorphism
animals = [Dog(), Cat()]
for animal in animals:
    print(animal.make_sound())
```

**Key Takeaway:** The caller doesn't need to know whether the animal is a Dog or Cat—it just calls `make_sound()` and Python dynamically executes the proper overridden method.""",
        created_at=datetime.utcnow() - timedelta(days=2),
    )
    db.add_all([m1, m2])

    # 4. Add Sample Quiz History
    quiz1 = Quiz(
        user_id=demo_user.id,
        topic="Python Fundamentals",
        difficulty="beginner",
        num_questions=5,
        score=5,
        total=5,
        time_taken=120,
        completed=True,
        questions=[
            {
                "question": "Which keyword is used to define a function in Python?",
                "options": {"A": "func", "B": "def", "C": "function", "D": "define"},
                "correct_answer": "B",
                "explanation": "In Python, functions are defined using the 'def' keyword."
            },
            {
                "question": "What is the output of type([]) in Python?",
                "options": {"A": "<class 'dict'>", "B": "<class 'set'>", "C": "<class 'list'>", "D": "<class 'tuple'>"},
                "correct_answer": "C",
                "explanation": "Square brackets [] represent a list in Python."
            }
        ],
        user_answers=["B", "C"],
        completed_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add(quiz1)

    # 5. Add Learning Path
    lpath = LearningPath(
        user_id=demo_user.id,
        topic="Python for Data Structures & Algorithms",
        level="intermediate",
        goal="Master technical interview coding questions",
        duration="6 weeks",
        hours_per_day=1.5,
        progress=35.0,
        completed_items=["w1_t1", "w1_t2"],
        content=[
            {
                "week": 1,
                "title": "Week 1 - Python Advanced Idioms & Complexity",
                "topics": [
                    {"id": "w1_t1", "name": "Time & Space Complexity (Big-O)", "difficulty": "intermediate", "estimated_hours": 3, "description": "Analyzing asymptotic performance of loops and operations."},
                    {"id": "w1_t2", "name": "List comprehensions, Generators & Iterators", "difficulty": "intermediate", "estimated_hours": 3, "description": "Memory-efficient data pipelines in Python."}
                ],
                "practice_task": "Implement a memory-efficient generator for prime numbers.",
                "quiz_topic": "Algorithmic Complexity"
            },
            {
                "week": 2,
                "title": "Week 2 - Linear Data Structures",
                "topics": [
                    {"id": "w2_t1", "name": "Linked Lists & Doubly Linked Lists", "difficulty": "intermediate", "estimated_hours": 4, "description": "Pointers and node traversal."},
                    {"id": "w2_t2", "name": "Stacks & Queues with collections.deque", "difficulty": "intermediate", "estimated_hours": 3, "description": "LIFO and FIFO applications."}
                ],
                "practice_task": "Build an undo/redo manager using two stacks.",
                "quiz_topic": "Stacks and Queues"
            },
            {
                "week": 3,
                "title": "Week 3 - Recursion & Divide-and-Conquer",
                "topics": [
                    {"id": "w3_t1", "name": "Call Stack & Base Cases", "difficulty": "intermediate", "estimated_hours": 4, "description": "Understanding stack frames and termination conditions."},
                    {"id": "w3_t2", "name": "Merge Sort & Binary Search", "difficulty": "intermediate", "estimated_hours": 4, "description": "Divide and conquer recursive algorithms."}
                ],
                "practice_task": "Implement recursive binary search with recursion trace.",
                "quiz_topic": "Recursion"
            }
        ]
    )
    db.add(lpath)

    # 6. Add Saved Items
    saved1 = SavedItem(
        user_id=demo_user.id,
        item_type="explanation",
        title="Recursion Call Stack & Stack Frames",
        content="""# Recursion & The Call Stack
Recursion occurs when a function invokes itself directly or indirectly. Every recursive call pushes a new execution context (stack frame) onto the program's Call Stack.
**Rule:** Always define a solid Base Case to avoid StackOverflow!""",
        metadata_json={"topic": "Recursion", "difficulty": "intermediate"}
    )
    saved2 = SavedItem(
        user_id=demo_user.id,
        item_type="summary",
        title="Database Normalization Summary (1NF to 3NF)",
        content="""# Database Normalization Summary
- **1NF**: Atomic values, unique records, no repeating groups.
- **2NF**: In 1NF + no partial dependency on composite key.
- **3NF**: In 2NF + no transitive dependency (X -> Y -> Z).""",
        metadata_json={"topic": "Database Management"}
    )
    db.add_all([saved1, saved2])

    # 7. Add Historical Activities for past 7 days (streak visualization)
    today = date.today()
    for i in range(7):
        act_date = datetime.combine(today - timedelta(days=i), datetime.min.time()) + timedelta(hours=14, minutes=30)
        db.add(LearningActivity(
            user_id=demo_user.id,
            activity_type="qa" if i % 2 == 0 else "quiz",
            topic="Python Fundamentals" if i < 3 else "Data Structures",
            details=f"Studied core concepts on day -{i}",
            xp_earned=20,
            duration=25,
            created_at=act_date
        ))

    db.commit()
    return demo_user

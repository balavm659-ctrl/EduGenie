# EduGenie — AI-Powered Personal Learning Companion 🎓✨

> **"Learn Smarter. Understand Faster. Grow Further."**  
> Developed for **Nan Mudhalvan** Academic Project Evaluation.  
> Powered by **FastAPI**, **Google Gemini 1.5**, **SQLite / PostgreSQL**, and **React + Vite + Tailwind CSS**.

---

## 🌟 Executive Overview
**EduGenie** is a next-generation pedagogical educational web application that moves far beyond a simple chatbot. It provides a complete educational ecosystem built around the core continuous learning feedback loop:

$$\text{QUESTION} \longrightarrow \text{EXPLANATION} \longrightarrow \text{PRACTICE} \longrightarrow \text{ASSESSMENT} \longrightarrow \text{PERSONALIZATION} \longrightarrow \text{PROGRESS}$$

---

## 🚀 Key Pedagogical Capabilities

1. **AI Academic Q&A (POST `/api/qa`)**
   - Natural language tutoring powered by Google Gemini.
   - Adapts technical depth to student's chosen proficiency level (Beginner, Intermediate, Advanced).
   - Code syntax highlighting, step-by-step mathematical proofs, and follow-up memory.

2. **Structured Concept Explanation (POST `/api/explain`)**
   - Synthesizes difficult topics progressively: Simple Definition, Why It Matters, Step-by-Step Breakdown, Real-World Analogy, Code Example, Common Student Mistakes, and Mini-Check Questions.

3. **Validated Quiz Generator (POST `/api/quiz`)**
   - Generates multiple choice questions (MCQ) strictly validated using **Pydantic schema models**.
   - Immediate scoring, interactive review, timer tracking, and error explanations.

4. **Weak Area Detection & Adaptive Intervention**
   - Evaluates quiz scores and identifies underperforming topics ($< 70\%$).
   - Automatically recommends targeted explanations and easier retry quizzes without manual user tagging.

5. **Smart Summarizer & Document Learner (POST `/api/summarize`)**
   - Summarizes text or uploaded **PDF / TXT** study notes.
   - Extracts Key Takeaways, Term Definitions, Exam Notes, and a **60-Second Flash Revision**.
   - Directly launch follow-up questions or generate quizzes from document content.

6. **Personalized Learning Paths (POST `/api/learn/path`)**
   - Generates week-by-week progressive curricula adapted to daily available hours, target goal, and duration.
   - Interactive topic checklists with real-time visual progress percentage.

7. **Gamification & Habit Analytics**
   - Learning streak counter ($\ge 7\text{ days}$ badge milestone).
   - Experience points (XP) for questions, quizzes, and summaries.
   - 28-day study matrix calendar and weekly activity charts via **Recharts**.

8. **Multilingual & Voice Support**
   - Native support for **English**, **Tamil (தமிழ்)**, and **Tanglish (Tamil + English)**.
   - Integrated **Voice Input** using the browser Web Speech API.

---

## 🏗️ System Architecture & Folder Structure

```text
EduGenie/
├── .env.example              # Environment configuration template
├── .env                      # Active local environment
├── .gitignore                # Git ignore rules
├── README.md                 # Project documentation
│
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # Application entrypoint & CORS middleware
│   ├── config.py             # Pydantic settings management
│   ├── database.py           # SQLAlchemy session & SQLite/Postgres engine
│   ├── models.py             # Database models (User, Quiz, LearningPath, etc.)
│   ├── schemas.py            # Pydantic request/response validation schemas
│   ├── explanation_module.py # Backwards-compatible explanation wrapper
│   ├── qna.py                # Backwards-compatible Q&A wrapper
│   ├── quiz_module.py        # Backwards-compatible quiz generator wrapper
│   ├── summary_module.py     # Backwards-compatible summarizer wrapper
│   ├── learning_path.py      # Backwards-compatible roadmap wrapper
│   ├── requirements.txt      # Python dependencies
│   ├── routes/
│   │   ├── auth.py           # Registration, login, profile, onboarding
│   │   ├── ai.py             # Q&A, explain, quiz, summarize, paths
│   │   ├── chat.py           # Conversation history & management
│   │   ├── progress.py       # Analytics, streaks, badges, dashboard
│   │   └── saved.py          # Bookmarked items CRUD
│   ├── services/
│   │   ├── auth_service.py   # Passlib bcrypt & JWT token handling
│   │   └── gemini_service.py # Google Gemini API integration & retry logic
│   ├── utils/
│   │   ├── prompts.py        # Dedicated educational prompt engineering
│   │   └── seed_data.py      # Demo student data generator
│   └── tests/
│       └── test_api.py       # Pytest unit & integration test suite
│
└── frontend/                 # React + Vite + Tailwind CSS Frontend
    ├── index.html            # HTML5 shell with Google Fonts
    ├── package.json          # Node dependencies
    ├── vite.config.js        # Vite build tool with proxy
    ├── tailwind.config.js    # Educational theme design system
    ├── postcss.config.js
    └── src/
        ├── main.jsx          # React DOM root render
        ├── App.jsx           # Routing & layout guards
        ├── index.css         # Glassmorphism & typography CSS
        ├── context/
        │   ├── AuthContext.jsx   # User session & 1-click demo login
        │   └── ThemeContext.jsx  # Dark/Light mode switcher
        ├── services/
        │   └── api.js            # Centralized fetch client
        ├── components/
        │   ├── Navbar.jsx        # Top header with streak/XP metrics
        │   ├── Sidebar.jsx       # Responsive navigation drawer
        │   ├── VoiceInput.jsx    # Speech-to-text button
        │   ├── LanguageSelector.jsx # English/Tamil/Tanglish toggle
        │   ├── LoadingSkeleton.jsx  # Animated pulse loaders
        │   └── EmptyState.jsx    # Meaningful empty states
        └── pages/
            ├── LandingPage.jsx   # Hero, features & workflow
            ├── LoginPage.jsx     # Login with 1-click Demo Student button
            ├── RegisterPage.jsx  # Student signup
            ├── OnboardingPage.jsx# Learning preferences wizard
            ├── DashboardPage.jsx # Central workspace & quick AI input
            ├── ChatPage.jsx      # AI Q&A with Markdown & Code copy
            ├── ExplainPage.jsx   # Concept explanation module
            ├── QuizPage.jsx      # Practice test & weak area analyzer
            ├── SummaryPage.jsx   # PDF/Text summarizer
            ├── LearningPathPage.jsx # Week-by-week curriculum
            ├── ProgressPage.jsx  # Visual charts & streak heatmap
            ├── HistoryPage.jsx   # Activity timeline
            ├── SavedPage.jsx     # Bookmarked study notes
            └── ProfilePage.jsx   # Profile & preferences settings
```

---

## ⚡ Installation & Setup Guide

### 1. Prerequisites
- **Python 3.10+** (Tested with Python 3.11)
- **Node.js 18+** & **npm**

### 2. Backend Setup
1. Open a terminal in the root directory:
   ```bash
   cd c:/Users/balamurugan/OneDrive/Desktop/EduGenie
   ```
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install Python requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Configure your `.env` file:
   - Copy `.env.example` to `.env` if not present.
   - Insert your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
     ```env
     GEMINI_API_KEY=AIzaSy...your_actual_key...
     DATABASE_URL=sqlite:///./edugenie.db
     JWT_SECRET=your_jwt_secret_key
     ```
5. Start the backend API server:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   *The backend will automatically create all database tables and seed the Demo Student account.*
   - API Docs: `http://localhost:8000/api/docs`
   - Health Check: `http://localhost:8000/api/health`

### 3. Frontend Setup
1. In a second terminal window, navigate to the `frontend/` folder:
   ```bash
   cd c:/Users/balamurugan/OneDrive/Desktop/EduGenie/frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Demo & Academic Evaluation Credentials
EduGenie includes a pre-seeded evaluation account so reviewers can immediately assess the full platform:

| Field | Value |
|---|---|
| **Email** | `student@edugenie.demo` |
| **Password** | `DemoPass123!` |
| **Quick Access** | Click **"Instant Access: Demo Student (1-Click)"** on the Login or Landing page |

---

## 🧪 Testing Backend Endpoints
Run the comprehensive test suite using pytest:
```bash
pytest backend/tests/test_api.py -v
```

---

## 🌐 Complete REST API Endpoint Specification

### Authentication
- `POST /api/auth/register` — Register a student account with hashed password
- `POST /api/auth/login` — Authenticate and receive JWT access token
- `GET /api/auth/me` — Retrieve current authenticated student profile
- `POST /api/auth/onboarding` — Update target topics, level, style, and language
- `PUT /api/auth/profile` — Update student profile preferences

### Pedagogical AI Core
- `POST /api/qa` — Academic Q&A with conversational context and prompt guardrails
- `POST /api/explain` — Concept explanation with step-by-step pedagogical structure
- `POST /api/quiz` — Generate strictly validated MCQ quiz
- `POST /api/quiz/submit` — Submit answers, calculate score, and trigger weak area detection
- `POST /api/summarize` — Text summarization with key points and exam revision
- `POST /api/summarize/upload` — Multipart PDF / TXT document extraction and summarization
- `POST /api/learn/path` — Generate week-by-week curriculum roadmap
- `GET /api/learn/recommendations` — Personalized suggestions based on quiz history

### Student Workspace & Progress
- `GET /api/dashboard` — Aggregated greeting, streak, active paths, and weak topic alerts
- `GET /api/progress` — Learning hours, quiz average, Recharts weekly data, and badges
- `GET /api/streak` — 28-day activity matrix calendar
- `GET /api/chats` — List conversation history
- `GET /api/saved` — Retrieve bookmarked explanations and notes

---

## 🎯 Nan Mudhalvan Presentation & Live Demonstration Flow

1. **Landing & Mission**: Show the clean, futuristic UI and explain the core pedagogical principle: *Learn $\to$ Practice $\to$ Test $\to$ Analyze $\to$ Improve*.
2. **Instant Demo Launch**: Click **Instant Demo Account** to demonstrate pre-existing learning analytics (Streak: 7 days, 420 XP).
3. **Concept Explanation**: Navigate to **Explain Concept**, type `Recursion`, and review the structured breakdown (Definition, Analogy, Code, Common Mistakes).
4. **Interactive Quiz & Weak Topic Detection**: Go to **Practice Quiz**, choose `Recursion`, answer questions. Show immediate grading and the automatic adaptive alert recommending review.
5. **Smart Document Summarizer**: Open **Smart Summarizer**, paste lecture notes or upload a PDF syllabus. Observe the extracted key terms and 1-minute exam revision.
6. **Curriculum Roadmap**: Navigate to **Learning Path**, view the active milestones, and mark a topic complete to observe real-time progress update.
7. **Analytics & Multilingual**: Switch the language to **தமிழ் (Tamil)** or **Tanglish** and show the weekly Recharts activity matrix.

---

## 🔮 Future Enhancements
- Fine-tuned local LLM fallback (Ollama / Llama-3-8B).
- Audio speech synthesis (Text-to-Speech) for full spoken tutoring.
- Collaborative study rooms and peer quiz leaderboards.
- Integration with university LMS portals (Canvas / Moodle).

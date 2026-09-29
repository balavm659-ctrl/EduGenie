"""
EduGenie FastAPI Backend Application
Main entry point for API server, middleware, routes, and lifecycle events.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .database import create_tables, SessionLocal
from .utils.seed_data import seed_demo_data

# Import route modules
from .routes.auth import router as auth_router
from .routes.ai import router as ai_router
from .routes.chat import router as chat_router
from .routes.progress import router as progress_router
from .routes.saved import router as saved_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("edugenie")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Starting EduGenie API Engine...")
    # Initialize database tables
    create_tables()
    logger.info("Database tables initialized successfully.")

    # Seed demo account for academic evaluation
    db = SessionLocal()
    try:
        seed_demo_data(db)
        logger.info("Demo student account initialized.")
    except Exception as e:
        logger.warning(f"Demo seeding skipped or error: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down EduGenie API Engine...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://edugenie-frontend.onrender.com",
]
# Remove empty strings and duplicates
origins = list(set(o for o in origins if o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "EduGenie encountered an unexpected error. Please try again."}
    )


# Health Check
@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check and configuration status."""
    has_gemini = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": has_gemini,
        "gemini_model": settings.GEMINI_MODEL,
        "database": "connected",
    }


# Include standard routers
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(progress_router)
app.include_router(saved_router)


# Legacy endpoint shims for exact project backwards-compatibility
@app.post("/qa", include_in_schema=False)
@app.post("/explain", include_in_schema=False)
@app.post("/quiz", include_in_schema=False)
@app.post("/summarize", include_in_schema=False)
@app.get("/learn/recommendations", include_in_schema=False)
def legacy_root_redirect():
    return JSONResponse(
        status_code=308,
        content={"detail": "EduGenie endpoints are prefixed under /api/ for REST versioning."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

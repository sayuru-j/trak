from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from database import init_db
from routes import tasks, settings, ai, auth

app = FastAPI(
    title="Trak API",
    version="1.0.0",
    description="AI-Powered Time Tracking API"
)

# Enable CORS for Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")

# Include routers
app.include_router(tasks.router)
app.include_router(settings.router)
app.include_router(ai.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Trak API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "tasks": "/tasks",
            "settings": "/settings",
            "ai": "/ai",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI Backend",
        "database": "connected"
    }

if __name__ == "__main__":
    print("Starting FastAPI server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


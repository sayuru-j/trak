from fastapi import APIRouter, HTTPException, Response, Cookie
from pydantic import BaseModel
from typing import Optional
import sys
import os
import hashlib
import secrets

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from database import SessionLocal
from models import User

router = APIRouter(prefix="/auth", tags=["auth"])

# Simple in-memory session store (for demo - use Redis in production)
active_sessions = {}


class SignupRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def create_session(user_id: int) -> str:
    """Create a new session token"""
    session_token = secrets.token_urlsafe(32)
    active_sessions[session_token] = user_id
    return session_token


def get_user_from_session(session_token: Optional[str]) -> Optional[int]:
    """Get user_id from session token"""
    if not session_token:
        return None
    return active_sessions.get(session_token)


@router.post("/signup")
def signup(request: SignupRequest, response: Response):
    """Create a new user account"""
    db = SessionLocal()
    try:
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == request.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email already exists
        if request.email:
            existing_email = db.query(User).filter(User.email == request.email).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new user
        password_hash = hash_password(request.password)
        new_user = User(
            username=request.username,
            email=request.email,
            password_hash=password_hash
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create session
        session_token = create_session(new_user.id)
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            max_age=30 * 24 * 60 * 60,  # 30 days
            samesite="lax"
        )
        
        return {
            "success": True,
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        }
    finally:
        db.close()


@router.post("/login")
def login(request: LoginRequest, response: Response):
    """Login with username and password"""
    db = SessionLocal()
    try:
        # Find user
        user = db.query(User).filter(User.username == request.username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Verify password
        password_hash = hash_password(request.password)
        if password_hash != user.password_hash:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Create session
        session_token = create_session(user.id)
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            max_age=30 * 24 * 60 * 60,  # 30 days
            samesite="lax"
        )
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }
    finally:
        db.close()


@router.post("/logout")
def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout and clear session"""
    if session_token and session_token in active_sessions:
        del active_sessions[session_token]
    
    response.delete_cookie(key="session_token")
    return {"success": True}


@router.get("/me")
def get_current_user(session_token: Optional[str] = Cookie(None)):
    """Get current logged-in user"""
    user_id = get_user_from_session(session_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    finally:
        db.close()


@router.get("/check")
def check_auth(session_token: Optional[str] = Cookie(None)):
    """Check if user is authenticated"""
    user_id = get_user_from_session(session_token)
    return {"authenticated": user_id is not None}


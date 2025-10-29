from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from database import get_db
from models import Settings

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingResponse(BaseModel):
    key: str
    value: Optional[str]


@router.get("/", response_model=dict)
def get_all_settings(db: Session = Depends(get_db)):
    """Get all settings as a dictionary"""
    settings = db.query(Settings).all()
    return {setting.key: setting.value for setting in settings}


@router.get("/{key}", response_model=SettingResponse)
def get_setting(key: str, db: Session = Depends(get_db)):
    """Get a specific setting"""
    setting = db.query(Settings).filter(Settings.key == key).first()
    if not setting:
        # Return default values for known settings
        defaults = {
            "use_ai": "false",
            "ollama_model": "mistral:7b-instruct-q4_0",
            "ollama_url": "http://localhost:11434",
            "theme": "system",
        }
        return {"key": key, "value": defaults.get(key, None)}
    
    return {"key": setting.key, "value": setting.value}


@router.post("/", response_model=SettingResponse)
def update_setting(setting: SettingUpdate, db: Session = Depends(get_db)):
    """Update or create a setting"""
    db_setting = db.query(Settings).filter(Settings.key == setting.key).first()
    
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = Settings(key=setting.key, value=setting.value)
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return {"key": db_setting.key, "value": db_setting.value}


@router.delete("/{key}")
def delete_setting(key: str, db: Session = Depends(get_db)):
    """Delete a setting"""
    setting = db.query(Settings).filter(Settings.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted successfully"}


@router.post("/initialize")
def initialize_settings(db: Session = Depends(get_db)):
    """Initialize default settings if they don't exist"""
    defaults = {
        "use_ai": "false",
        "ollama_model": "mistral:7b-instruct-q4_0",
        "ollama_url": "http://localhost:11434",
        "theme": "system",
    }
    
    for key, value in defaults.items():
        existing = db.query(Settings).filter(Settings.key == key).first()
        if not existing:
            db.add(Settings(key=key, value=value))
    
    db.commit()
    return {"message": "Settings initialized"}


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Task

router = APIRouter(prefix="/tasks", tags=["tasks"])


# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    end_time: Optional[str] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    start_time: str
    end_time: Optional[str]
    duration: float
    status: str
    tags: List[str]
    created_at: str
    updated_at: str


@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    db_task = Task(
        title=task.title,
        description=task.description,
        category=task.category,
        tags=",".join(task.tags) if task.tags else None,
        start_time=datetime.utcnow(),
        status="in_progress"
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task.to_dict()


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks with optional filtering"""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.start_time.desc()).offset(skip).limit(limit).all()
    return [task.to_dict() for task in tasks]


@router.get("/today", response_model=List[TaskResponse])
def get_today_tasks(db: Session = Depends(get_db)):
    """Get today's tasks"""
    today = datetime.utcnow().date()
    tasks = db.query(Task).filter(
        Task.start_time >= today
    ).order_by(Task.start_time.desc()).all()
    return [task.to_dict() for task in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task.to_dict()


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.category is not None:
        task.category = task_update.category
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.tags is not None:
        task.tags = ",".join(task_update.tags)
    if task_update.end_time is not None:
        task.end_time = datetime.fromisoformat(task_update.end_time.replace('Z', '+00:00'))
        # Calculate duration
        if task.start_time and task.end_time:
            duration = (task.end_time - task.start_time).total_seconds() / 60
            task.duration = round(duration, 2)
    
    db.commit()
    db.refresh(task)
    return task.to_dict()


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/stop")
def stop_task(task_id: int, db: Session = Depends(get_db)):
    """Stop a running task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.end_time = datetime.utcnow()
    task.status = "completed"
    
    # Calculate duration
    if task.start_time:
        duration = (task.end_time - task.start_time).total_seconds() / 60
        task.duration = round(duration, 2)
    
    db.commit()
    db.refresh(task)
    return task.to_dict()


@router.get("/stats/summary")
def get_stats_summary(db: Session = Depends(get_db)):
    """Get statistics summary"""
    today = datetime.utcnow().date()
    
    # Today's tasks
    today_tasks = db.query(Task).filter(Task.start_time >= today).all()
    total_time_today = sum(task.duration for task in today_tasks)
    
    # All time stats
    all_tasks = db.query(Task).all()
    total_tasks = len(all_tasks)
    total_time_all = sum(task.duration for task in all_tasks)
    
    return {
        "today": {
            "tasks_count": len(today_tasks),
            "total_time": round(total_time_today, 2),
        },
        "all_time": {
            "tasks_count": total_tasks,
            "total_time": round(total_time_all, 2),
        }
    }


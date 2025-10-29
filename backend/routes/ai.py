from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import sys
import os
import requests
import json

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.ollama_client import (
    check_ollama_available,
    get_ollama_models,
    generate_task_title,
    generate_task_summary,
    generate_category_suggestion,
    generate_enhanced_description
)

router = APIRouter(prefix="/ai", tags=["ai"])


class OllamaStatusResponse(BaseModel):
    available: bool
    models: List[Dict]


class GenerateTitleRequest(BaseModel):
    description: str
    model: Optional[str] = "mistral:7b-instruct-q4_0"
    url: Optional[str] = "http://localhost:11434"


class GenerateSummaryRequest(BaseModel):
    tasks: List[Dict]
    model: Optional[str] = "mistral:7b-instruct-q4_0"
    url: Optional[str] = "http://localhost:11434"


class GenerateCategoryRequest(BaseModel):
    title: str
    description: Optional[str] = None
    model: Optional[str] = "mistral:7b-instruct-q4_0"
    url: Optional[str] = "http://localhost:11434"


class EnhanceTaskRequest(BaseModel):
    user_input: str
    model: Optional[str] = "mistral:7b-instruct-q4_0"
    url: Optional[str] = "http://localhost:11434"


class ChatRequest(BaseModel):
    message: str
    context: Dict
    model: Optional[str] = "mistral:7b-instruct-q4_0"
    url: Optional[str] = "http://localhost:11434"


@router.get("/status", response_model=OllamaStatusResponse)
def get_ollama_status(url: Optional[str] = Query(None, description="Ollama API URL")):
    """Check if Ollama is available and get list of models"""
    # Use provided URL or default
    ollama_url = url or "http://localhost:11434"
    
    print(f"[AI Status] Checking Ollama at {ollama_url}")
    available = check_ollama_available(ollama_url)
    models = get_ollama_models(ollama_url) if available else []
    
    return {
        "available": available,
        "models": models
    }


@router.post("/generate-title")
def generate_title(request: GenerateTitleRequest):
    """Generate a task title from description"""
    if not check_ollama_available(request.url):
        raise HTTPException(status_code=503, detail="Ollama is not available")
    
    title = generate_task_title(request.description, request.model, request.url)
    
    if not title:
        raise HTTPException(status_code=500, detail="Failed to generate title")
    
    return {"title": title}


@router.post("/generate-summary")
def generate_summary(request: GenerateSummaryRequest):
    """Generate a summary of tasks"""
    if not check_ollama_available(request.url):
        raise HTTPException(status_code=503, detail="Ollama is not available")
    
    summary = generate_task_summary(request.tasks, request.model, request.url)
    
    if not summary:
        raise HTTPException(status_code=500, detail="Failed to generate summary")
    
    return {"summary": summary}


@router.post("/generate-category")
def generate_category(request: GenerateCategoryRequest):
    """Suggest a category for a task"""
    if not check_ollama_available(request.url):
        raise HTTPException(status_code=503, detail="Ollama is not available")
    
    category = generate_category_suggestion(
        request.title,
        request.description or "",
        request.model,
        request.url
    )
    
    if not category:
        raise HTTPException(status_code=500, detail="Failed to generate category")
    
    return {"category": category}


@router.post("/enhance-task")
def enhance_task(request: EnhanceTaskRequest):
    """Generate both enhanced title and description from user input"""
    if not check_ollama_available(request.url):
        raise HTTPException(status_code=503, detail="Ollama is not available")
    
    # Generate title and description in parallel would be ideal, but for now do it sequentially
    title = generate_task_title(request.user_input, request.model, request.url)
    description = generate_enhanced_description(request.user_input, request.model, request.url)
    
    # Fallback to user input if generation fails
    if not title:
        title = request.user_input
    if not description:
        description = request.user_input
    
    return {
        "title": title,
        "description": description
    }


@router.post("/chat")
def chat(request: ChatRequest):
    """Chat with AI assistant about productivity and tasks (streaming)"""
    print(f"[AI Chat] Received request with message: {request.message}")
    print(f"[AI Chat] Model: {request.model}, URL: {request.url}")
    
    if not check_ollama_available(request.url):
        print("[AI Chat] Ollama is not available")
        raise HTTPException(status_code=503, detail="Ollama is not available")
    
    # Build context from provided data
    context = request.context
    today_stats = context.get("today_stats", {})
    alltime_stats = context.get("alltime_stats", {})
    recent_tasks = context.get("recent_tasks", [])
    current_task = context.get("current_task", "None")
    
    print(f"[AI Chat] Context - Today: {today_stats}, All time: {alltime_stats}")
    
    # Create context string
    context_str = f"""Current Context:
- Today's Stats: {today_stats.get('tasks_count', 0)} tasks, {today_stats.get('total_time', 0)} minutes tracked
- All Time: {alltime_stats.get('tasks_count', 0)} tasks, {alltime_stats.get('total_time', 0)} minutes total
- Recent Tasks: {', '.join(recent_tasks) if recent_tasks else 'None'}
- Current Task: {current_task}
"""
    
    prompt = f"""{context_str}

User Question: {request.message}

You are a helpful productivity assistant for the TRAK time tracking app. Provide concise, friendly, and actionable insights based on the user's tasks and productivity data. Keep responses brief (2-3 sentences max). Be encouraging and supportive."""

    def generate():
        try:
            print(f"[AI Chat] Sending streaming request to Ollama...")
            
            response = requests.post(
                f"{request.url}/api/generate",
                json={
                    "model": request.model,
                    "prompt": prompt,
                    "stream": True,  # Enable streaming
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": 200,
                    }
                },
                stream=True,
                timeout=30
            )
            
            if response.status_code != 200:
                error_msg = f"Failed to get AI response: {response.status_code}"
                print(f"[AI Chat] Error: {error_msg}")
                yield f"data: {json.dumps({'error': error_msg})}\n\n"
                return
            
            print(f"[AI Chat] Streaming response...")
            
            # Stream the response
            for line in response.iter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        if "response" in chunk:
                            token = chunk["response"]
                            # Send token as SSE
                            yield f"data: {json.dumps({'token': token})}\n\n"
                        
                        # Check if done
                        if chunk.get("done", False):
                            yield f"data: {json.dumps({'done': True})}\n\n"
                            print(f"[AI Chat] Streaming complete")
                            break
                    except json.JSONDecodeError:
                        continue
                        
        except requests.exceptions.RequestException as e:
            error_msg = f"Cannot connect to Ollama: {str(e)}"
            print(f"[AI Chat] Connection error: {error_msg}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
        except Exception as e:
            error_msg = f"Unexpected error: {type(e).__name__} - {str(e)}"
            print(f"[AI Chat] Unexpected error: {error_msg}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


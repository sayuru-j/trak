import requests
from typing import Optional, List, Dict


def check_ollama_available(url: str = "http://localhost:11434") -> bool:
    """Check if Ollama is running and available"""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        if response.status_code == 200:
            print(f"[Ollama] Successfully connected to {url}")
            return True
        else:
            print(f"[Ollama] Connection failed: HTTP {response.status_code} from {url}")
            return False
    except requests.exceptions.ConnectionError as e:
        print(f"[Ollama] Connection error to {url}: {str(e)}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"[Ollama] Timeout connecting to {url} (timeout: 5s)")
        return False
    except requests.exceptions.RequestException as e:
        print(f"[Ollama] Request error to {url}: {str(e)}")
        return False
    except Exception as e:
        print(f"[Ollama] Unexpected error checking {url}: {type(e).__name__} - {str(e)}")
        return False


def get_ollama_models(url: str = "http://localhost:11434") -> List[Dict]:
    """Get list of available Ollama models"""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get("models", [])
            print(f"[Ollama] Found {len(models)} model(s) at {url}")
            return models
        else:
            print(f"[Ollama] Failed to get models: HTTP {response.status_code} from {url}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"[Ollama] Error getting models from {url}: {str(e)}")
        return []
    except Exception as e:
        print(f"[Ollama] Unexpected error getting models from {url}: {type(e).__name__} - {str(e)}")
        return []


def generate_task_title(task_description: str, model: str = "mistral:7b-instruct-q4_0", url: str = "http://localhost:11434") -> Optional[str]:
    """Generate a task title from description using Ollama"""
    if not task_description:
        return None
    
    prompt = f"""You are a task title generator. Create a clear, professional task title.

User input: "{task_description}"

Generate a concise task title (3-8 words) that:
- Starts with an action verb (e.g., "Design", "Implement", "Review", "Fix", "Update")
- Is specific and clear
- Follows best practices for task naming

Examples:
Input: "working on the new login page"
Output: Design New Login Page

Input: "fixing bugs in the payment system"
Output: Fix Payment System Bugs

Input: "meeting with the team about Q4 planning"
Output: Team Meeting - Q4 Planning

Now generate a title for: "{task_description}"

Return ONLY the title, no explanations or quotes."""

    try:
        response = requests.post(
            f"{url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 50,
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            title = result.get("response", "").strip()
            # Clean up any quotes or extra formatting
            title = title.replace('"', '').replace("'", '').strip()
            # Remove "Title:" or "Output:" prefixes if present
            if ':' in title:
                title = title.split(':', 1)[1].strip()
            return title
        return None
    except:
        return None


def generate_task_summary(tasks: List[Dict], model: str = "mistral:7b-instruct-q4_0", url: str = "http://localhost:11434") -> Optional[str]:
    """Generate a summary of tasks using Ollama"""
    if not tasks:
        return None
    
    tasks_text = "\n".join([
        f"- {task.get('title', 'Untitled')} ({task.get('duration', 0):.1f} min)"
        for task in tasks
    ])
    
    prompt = f"""Summarize this work session in 2-3 sentences:

Tasks completed:
{tasks_text}

Provide a brief, professional summary of what was accomplished."""

    try:
        response = requests.post(
            f"{url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        return None
    except:
        return None


def generate_enhanced_description(user_input: str, model: str = "mistral:7b-instruct-q4_0", url: str = "http://localhost:11434") -> Optional[str]:
    """Generate an enhanced, detailed description from user input"""
    if not user_input:
        return None
    
    prompt = f"""You are a task description enhancer. Create a clear, professional task description.

User input: "{user_input}"

Generate a detailed description (1-2 sentences) that:
- Provides context and clarity
- Is professional and specific
- Adds helpful details without assumptions
- Remains concise

Examples:
Input: "working on the new login page"
Output: Designing and implementing the new login page interface with improved UX and security features.

Input: "fixing bugs in payment"
Output: Investigating and resolving reported bugs in the payment processing system to ensure reliable transactions.

Input: "team meeting q4"
Output: Attending team meeting to discuss Q4 planning, goals, and project priorities.

Now generate a description for: "{user_input}"

Return ONLY the description, no explanations or quotes."""

    try:
        response = requests.post(
            f"{url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.5,
                    "top_p": 0.9,
                    "max_tokens": 100,
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            description = result.get("response", "").strip()
            # Clean up any quotes or extra formatting
            description = description.replace('"', '').replace("'", '').strip()
            # Remove "Description:" or "Output:" prefixes if present
            if ':' in description and len(description.split(':', 1)[0]) < 20:
                description = description.split(':', 1)[1].strip()
            return description
        return None
    except:
        return None


def generate_category_suggestion(task_title: str, task_description: str, model: str = "mistral:7b-instruct-q4_0", url: str = "http://localhost:11434") -> Optional[str]:
    """Suggest a category for a task using Ollama"""
    prompt = f"""Based on this task, suggest ONE category from: Work, Personal, Learning, Meeting, Break, Other

Task: {task_title}
Description: {task_description or 'N/A'}

Return ONLY the category name, nothing else."""

    try:
        response = requests.post(
            f"{url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                }
            },
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            category = result.get("response", "").strip()
            # Validate category
            valid_categories = ["Work", "Personal", "Learning", "Meeting", "Break", "Other"]
            for valid in valid_categories:
                if valid.lower() in category.lower():
                    return valid
            return "Other"
        return None
    except:
        return None


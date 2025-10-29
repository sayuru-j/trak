# 🤖 AI-Enhanced Task Creation

## Overview

TRAK now intelligently processes your task descriptions using AI to generate professional, clean task titles following best practices!

## ✨ How It Works

### Step-by-Step Flow

1. **User Opens Task Modal**
   - Click "Start Task" or the floating "+" button
   - Modal checks if AI is enabled in settings

2. **User Describes Their Work**
   ```
   User types: "working on the homepage redesign for the client"
   ```

3. **AI Processing** (if enabled)
   - Sends description to Ollama
   - AI generates a clean, professional title
   - Follows task naming best practices
   - Uses action verbs (Design, Implement, Fix, Review, etc.)

4. **Task Created**
   ```
   Title: "Design Homepage for Client"
   Description: "working on the homepage redesign for the client"
   Status: in_progress
   Start Time: Current timestamp
   ```

5. **Timer Starts Immediately**
   - User sees toast notification with AI-generated title
   - Timer begins tracking
   - Task saved to database

## 🎯 Examples

### Example 1: Development Work
```
Input:  "fixing the login bug where users can't reset password"
Output: Fix Login Password Reset Bug
```

### Example 2: Design Work
```
Input:  "creating mockups for the new dashboard"
Output: Create Dashboard Mockups
```

### Example 3: Meeting
```
Input:  "meeting with the team about Q4 goals"
Output: Team Meeting - Q4 Goals
```

### Example 4: Documentation
```
Input:  "updating the API documentation with new endpoints"
Output: Update API Documentation
```

## 🔧 Technical Details

### Frontend (TaskEntryModal.tsx)

```typescript
// Check if AI is enabled
const checkAISettings = async () => {
  const response = await fetch(`${API_URL}/settings/use_ai`);
  const data = await response.json();
  setUseAI(data.value === "true");
};

// Process with AI
const titleResponse = await fetch(`${API_URL}/ai/generate-title`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    description: userInput,
    model: settings.ollama_model,
    url: settings.ollama_url,
  }),
});
```

### Backend (ollama_client.py)

```python
def generate_task_title(task_description: str, model: str, url: str):
    prompt = f"""You are a task title generator.
    
    User input: "{task_description}"
    
    Generate a concise task title (3-8 words) that:
    - Starts with an action verb
    - Is specific and clear
    - Follows best practices
    
    Return ONLY the title."""
    
    # Call Ollama API
    # Clean and return title
```

## 💡 UI States

### Without AI
- Sparkle icon is grayed out
- Description: "Enter your task title. Enable AI in settings..."
- Button: "Start Tracking"
- Uses input directly as title

### With AI
- Sparkle icon is highlighted (accent color)
- Description: "Describe your task naturally. AI will generate a clean title..."
- Button shows sparkle icon: "✨ Start Tracking"
- While processing: "⏳ AI Processing..."

### During AI Processing
- Input field disabled
- Cancel button disabled
- Submit button shows spinner: "AI Processing..."
- Takes 2-5 seconds depending on model

## 🛡️ Error Handling

### Fallback Behavior
If AI fails for any reason:
1. Task is created using user input as title
2. Toast notification: "AI Unavailable - Task created without AI enhancement"
3. Timer starts normally
4. User can continue working

### Common Scenarios
- **Ollama not running**: Falls back to manual input
- **Network timeout**: Falls back after 30 seconds
- **Invalid model**: Falls back to manual input
- **API error**: Falls back gracefully

## ⚙️ Configuration

### Settings Required
- `use_ai`: "true" or "false"
- `ollama_model`: Model name (e.g., "mistral:7b-instruct-q4_0")
- `ollama_url`: Ollama API URL (default: "http://localhost:11434")

### AI Prompt Parameters
- **Temperature**: 0.3 (more focused, less creative)
- **Top P**: 0.9 (consistent quality)
- **Max Tokens**: 50 (short, concise titles)
- **Timeout**: 30 seconds

## 📊 Benefits

### For Users
- ✅ **Faster task entry** - Just describe naturally
- ✅ **Consistent naming** - AI ensures best practices
- ✅ **Less thinking** - No need to formulate perfect titles
- ✅ **Professional results** - Clean, actionable titles
- ✅ **Original context preserved** - Description stores your exact words

### For Data Quality
- ✅ Standardized task naming
- ✅ Better searchability
- ✅ Improved analytics
- ✅ Clearer activity timeline
- ✅ More useful summaries

## 🔄 Future Enhancements

- [ ] Category auto-suggestion based on task description
- [ ] Tags extraction from description
- [ ] Estimated duration prediction
- [ ] Similar task detection (avoid duplicates)
- [ ] Batch processing for multiple tasks
- [ ] Custom prompt templates per user

## 🧪 Testing

### Manual Testing
1. Enable AI in Settings
2. Create task: "working on the homepage"
3. Verify title is enhanced
4. Check description contains original input
5. Disable AI
6. Create task with same input
7. Verify title = input

### Edge Cases
- Empty input
- Very long input (500+ chars)
- Special characters
- Multiple languages
- Emojis in input

## 📝 Notes

- AI processing adds 2-5 seconds to task creation
- Works offline without AI (manual mode)
- Requires Ollama installed locally
- No data sent to external servers
- Fully private and local processing


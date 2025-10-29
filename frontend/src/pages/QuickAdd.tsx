import { useState, useEffect } from "react";
import { Play, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_URL = window.api?.apiUrl || "http://127.0.0.1:8000";

const QuickAdd = () => {
  const [taskInput, setTaskInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAISettings();
    
    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.close();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const checkAISettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/use_ai`);
      const data = await response.json();
      setUseAI(data.value === "true");
    } catch (error) {
      console.error("Failed to check AI settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const userInput = taskInput.trim();
    setIsProcessing(true);

    try {
      let taskTitle = userInput;
      let taskDescription = userInput;

      // If AI is enabled, generate title
      if (useAI) {
        try {
          const settingsResponse = await fetch(`${API_URL}/settings/`);
          const settings = await settingsResponse.json();
          const model = settings.ollama_model || "mistral:7b-instruct-q4_0";
          const url = settings.ollama_url || "http://localhost:11434";

          const titleResponse = await fetch(`${API_URL}/ai/generate-title`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: userInput,
              model: model,
              url: url,
            }),
          });

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            taskTitle = titleData.title.replace(/^["']|["']$/g, '').trim();
          }
        } catch (aiError) {
          console.error("AI generation failed, using manual title:", aiError);
        }
      }

      // Create task
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          category: null,
          tags: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      toast({
        title: "Task Started",
        description: `Tracking: ${taskTitle}`,
      });

      setTaskInput("");
      
      // Close the quick add window after 1 second
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error("Failed to start task:", error);
      toast({
        title: "Error",
        description: "Failed to start task",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="h-screen w-screen flex items-end justify-end p-0">
      <div className="w-[420px] bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl overflow-hidden">
        {/* Compact Header with Input and Button */}
        <div className="flex items-center gap-2 p-3">
          <Input
            placeholder="What are you working on?"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && taskInput.trim() && !isProcessing) {
                handleSubmit(e);
              }
            }}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
            autoFocus
            disabled={isProcessing}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">0:00:00</span>
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!taskInput.trim() || isProcessing}
              onClick={handleSubmit}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAdd;


import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = window.api?.apiUrl || "http://127.0.0.1:8765";

interface TaskEntryModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (taskTitle: string, description?: string) => void;
}

export default function TaskEntryModal({ open, onClose, onStart }: TaskEntryModalProps) {
  const [taskInput, setTaskInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAISettings();
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

    // Create task immediately with user input (non-blocking)
    onStart(userInput, userInput);
    setTaskInput("");
    onClose();

    // If AI is enabled, update the task in the background
    if (useAI) {
      setIsProcessing(true);
      
      // Show a toast that AI is processing
      toast({
        title: "Task Started",
        description: "AI is enhancing your task in the background...",
      });

      // Process AI asynchronously (non-blocking)
      setTimeout(async () => {
        try {
          // Get settings for model and URL
          const settingsResponse = await fetch(`${API_URL}/settings/`);
          const settings = await settingsResponse.json();
          const model = settings.ollama_model || "mistral:7b-instruct-q4_0";
          const url = settings.ollama_url || "http://localhost:11434";

          // Generate title using AI
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
            const aiTitle = titleData.title.replace(/^["']|["']$/g, '').trim();
            
            // Import store to update the current task
            const { useStore } = await import("@/store/useStore");
            const currentTask = useStore.getState().currentTask;
            
            if (currentTask) {
              // Update the task with AI-generated title
              await fetch(`${API_URL}/tasks/${currentTask.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: aiTitle,
                  description: userInput,
                }),
              });
              
              // Refresh the store
              useStore.getState().fetchTodayTasks();
              
              toast({
                title: "✨ AI Enhanced",
                description: `Updated to: "${aiTitle}"`,
              });
            }
          }
        } catch (error) {
          console.error("AI generation failed:", error);
          // Task is already created with user input, so this is fine
        } finally {
          setIsProcessing(false);
        }
      }, 100); // Small delay to ensure task is created first
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${useAI ? 'text-accent' : 'text-muted-foreground'}`} />
            What are you working on?
          </DialogTitle>
          <DialogDescription>
            {useAI 
              ? "Describe your task naturally. AI will generate a clean title for you."
              : "Enter your task title. Enable AI in settings for automatic enhancement."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="e.g., Working on the homepage redesign"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className="text-base"
            autoFocus
            disabled={isProcessing}
          />
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="accent" 
              disabled={!taskInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AI Processing...
                </>
              ) : (
                <>
                  {useAI && <Sparkles className="h-4 w-4 mr-2" />}
                  Start Tracking
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

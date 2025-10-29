import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = window.api?.apiUrl || "http://127.0.0.1:8000";

interface Task {
  id: number;
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  status: string;
  tags: string[];
}

interface TaskEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  task: Task | null;
}

export default function TaskEditModal({ open, onClose, onSave, task }: TaskEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
    checkAISettings();
  }, [task]);

  const checkAISettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/use_ai`);
      const data = await response.json();
      setUseAI(data.value === "true");
    } catch (error) {
      console.error("Failed to check AI settings:", error);
    }
  };

  const handleRegenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description to generate a title.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const settingsResponse = await fetch(`${API_URL}/settings/`);
      const settings = await settingsResponse.json();
      const model = settings.ollama_model || "mistral:7b-instruct-q4_0";
      const url = settings.ollama_url || "http://localhost:11434";

      const titleResponse = await fetch(`${API_URL}/ai/generate-title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description,
          model: model,
          url: url,
        }),
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const aiTitle = titleData.title.replace(/^["']|["']$/g, '').trim();
        setTitle(aiTitle);
        
        toast({
          title: "AI Generated",
          description: `New title: "${aiTitle}"`,
        });
      } else {
        throw new Error("AI generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        title: "AI Unavailable",
        description: "Failed to generate title. Please edit manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      toast({
        title: "Task Updated",
        description: "Your changes have been saved.",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details. {useAI && "Use AI to regenerate the title."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What were you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {useAI && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerate}
              disabled={isProcessing || !description.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Title with AI
                </>
              )}
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
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
              disabled={isProcessing || !title.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


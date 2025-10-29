import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, Briefcase, Clock, Loader2, Pencil, Trash2, Sparkles } from "lucide-react";
import TaskEditModal from "./TaskEditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore, Task } from "@/store/useStore";

const API_URL = window.api?.apiUrl || "http://127.0.0.1:8000";

interface TimelineItem {
  id: number;
  title: string;
  type: "task" | "break";
  startTime: string;
  endTime: string;
  duration: string;
}

export default function ActivityTimeline() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summary, setSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const { toast } = useToast();
  
  // Get state and actions from Zustand store
  const { tasks, fetchTodayTasks, deleteTask, settings } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);
  
  // Update timeline when tasks change
  useEffect(() => {
    const timeline: TimelineItem[] = tasks
      .filter(task => task.end_time) // Only show completed tasks
      .map(task => ({
        id: task.id,
        title: task.title,
        type: task.title.toLowerCase().includes("break") ? "break" : "task",
        startTime: formatTime(new Date(task.start_time)),
        endTime: formatTime(new Date(task.end_time!)),
        duration: formatDuration(task.duration || 0),
      }));
    setTimelineData(timeline);
  }, [tasks]);

  const loadTasks = async () => {
    setLoading(true);
    await fetchTodayTasks();
    setLoading(false);
  };

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Task Deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!settings.use_ai) {
      toast({
        title: "AI Disabled",
        description: "Please enable AI in settings to use this feature.",
        variant: "destructive",
      });
      return;
    }

    const completedTasks = tasks.filter(t => t.end_time);
    if (completedTasks.length === 0) {
      toast({
        title: "No Tasks",
        description: "Complete some tasks first to generate a summary.",
      });
      return;
    }

    setGeneratingSummary(true);
    setShowSummaryDialog(true);
    setSummary("Generating your work summary...");

    try {
      const response = await fetch(`${API_URL}/ai/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: completedTasks.map(t => ({
            title: t.title,
            description: t.description,
            duration: t.duration || 0,
          })),
          model: settings.ollama_model,
          url: settings.ollama_url,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        throw new Error("Failed to generate summary");
      }
    } catch (error) {
      console.error("Summary generation failed:", error);
      setSummary("Failed to generate summary. Please try again.");
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Activity Timeline</h1>
          <p className="text-muted-foreground">Your work sessions and breaks for today</p>
        </div>
        {timelineData.length > 0 && (
          <Button
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            variant="outline"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {generatingSummary ? "Generating..." : "Summarize"}
          </Button>
        )}
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed tasks yet today.</p>
              <p className="text-sm mt-2">Start tracking your time to see your activity timeline!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineData.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      item.type === "task"
                        ? "bg-accent/10 text-accent"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {item.type === "task" ? (
                      <Briefcase className="h-5 w-5" />
                    ) : (
                      <Coffee className="h-5 w-5" />
                    )}
                  </div>
                  {index < timelineData.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border my-1 min-h-[40px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-card border border-border rounded-lg p-4 hover-lift group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold flex-1">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === "task" ? "default" : "outline"}>
                          {item.duration}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              const task = tasks.find(t => t.id === item.id);
                              if (task) setEditingTask(task);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletingTaskId(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <TaskEditModal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={() => {
          loadTasks();
          setEditingTask(null);
        }}
        task={editingTask}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task from your timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTaskId && handleDelete(deletingTaskId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Work Summary
            </DialogTitle>
            <DialogDescription>
              AI-generated summary of your work today
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {generatingSummary ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{summary}</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

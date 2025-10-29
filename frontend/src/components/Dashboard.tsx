import { useState, useEffect } from "react";
import { Play, Pause, Square, Coffee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskEntryModal from "./TaskEntryModal";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Get state and actions from Zustand store
  const {
    currentTask,
    isTimerRunning,
    isPaused,
    elapsedSeconds,
    stats,
    tasks,
    fetchStats,
    fetchTodayTasks,
    stopTask,
    createTask,
    pauseTimer,
    resumeTimer,
    setElapsedSeconds: updateElapsedSeconds,
  } = useStore();

  // Timer interval effect - now calculates from start time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isPaused) {
      interval = setInterval(() => {
        const state = useStore.getState();
        if (state.timerState.startTime) {
          const elapsed = Math.floor((Date.now() - state.timerState.startTime) / 1000) - state.timerState.pausedTime;
          updateElapsedSeconds(elapsed);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused, updateElapsedSeconds]);

  // Load initial data
  useEffect(() => {
    fetchStats();
    fetchTodayTasks();
  }, [fetchStats, fetchTodayTasks]);

  // Calculate breaks from tasks
  const breaks = tasks.filter((t) => t.title.toLowerCase().includes("break")).length;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async (taskTitle: string, description?: string) => {
    const task = await createTask(taskTitle, description);
    if (task) {
      setIsModalOpen(false);
      toast({
        title: "Task Started",
        description: `Tracking: ${taskTitle}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to start task",
        variant: "destructive",
      });
    }
  };

  const handlePause = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = async () => {
    if (!currentTask) return;

    try {
      await stopTask(currentTask.id);
      toast({
        title: "Task Completed",
        description: `Logged ${formatTime(elapsedSeconds)}`,
      });
    } catch (error) {
      console.error("Failed to stop task:", error);
      toast({
        title: "Error",
        description: "Failed to stop task",
        variant: "destructive",
      });
    }
  };

  const handleBreak = async () => {
    await handleStart("Break Time", "Taking a break");
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Timer Card */}
      <Card className="timer-gradient shadow-elegant border-border/50 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {currentTask ? currentTask.title : "No active task"}
            </CardTitle>
            {isTimerRunning && (
              <Badge
                variant="outline"
                className={`${
                  isPaused
                    ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    : "border-accent text-accent"
                }`}
              >
                {isPaused ? "Paused" : "Active"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div
                className={`text-6xl font-bold tracking-tight ${
                  isTimerRunning && !isPaused
                    ? "text-accent"
                    : isPaused
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isTimerRunning ? (
                <>
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => setIsModalOpen(true)}
                    className="px-8"
                  >
                    <Play className="h-5 w-5" />
                    Start Task
                  </Button>
                  <Button variant="timer" size="lg" onClick={handleBreak}>
                    <Coffee className="h-5 w-5" />
                    Take Break
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="timer" size="lg" onClick={handlePause}>
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="destructive" size="lg" onClick={handleStop}>
                    <Square className="h-5 w-5" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.today.tasks_count}</div>
              <div className="text-sm text-muted-foreground mt-1">Tasks Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {formatDuration(stats.today.total_time)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Focus Time</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{breaks}</div>
              <div className="text-sm text-muted-foreground mt-1">Breaks Taken</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Entry Modal */}
      <TaskEntryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStart}
      />

      {/* Floating Add Button */}
      <Button
        variant="accent"
        size="icon"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

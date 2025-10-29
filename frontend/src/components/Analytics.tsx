import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Target, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const { stats, fetchStats } = useStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    await fetchStats();
    setLoading(false);
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
    <div className="container mx-auto px-6 py-8 max-w-6xl pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-muted-foreground">Insights into your productivity patterns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today</p>
                <p className="text-3xl font-bold text-accent">
                  {formatDuration(stats?.today.total_time || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.today.tasks_count || 0} tasks completed
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">All Time</p>
                <p className="text-3xl font-bold text-accent">
                  {formatDuration(stats?.all_time.total_time || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Total focus time
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-accent">
                  {stats?.all_time.tasks_count || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">All time</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Card */}
      <Card className="shadow-elegant">
        <CardContent className="pt-6 text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">More Analytics Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Weekly trends, category breakdowns, and AI-generated insights will appear here as you track more tasks.
          </p>
          <p className="text-sm text-muted-foreground">
            Keep tracking your time to unlock detailed analytics! 📊
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

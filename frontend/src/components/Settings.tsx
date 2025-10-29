import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Loader2, CheckCircle2, XCircle, Download, Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import { useStore } from "@/store/useStore";

const API_URL = window.api?.apiUrl || "http://127.0.0.1:8765";

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

const Settings = () => {
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  
  // Get settings from Zustand store
  const { settings, fetchSettings, updateSettings, fetchTasks, deleteTask } = useStore();
  const useAI = settings.use_ai;
  const selectedModel = settings.ollama_model;

  useEffect(() => {
    loadSettings();
  }, []);

  // Check Ollama status after settings are loaded or when URL changes
  useEffect(() => {
    if (!loading && settings.ollama_url) {
      checkOllamaStatus();
    }
  }, [settings.ollama_url, loading]);

  const loadSettings = async () => {
    await fetchSettings();
    setLoading(false);
  };

  const checkOllamaStatus = async () => {
    const ollamaUrl = settings.ollama_url || "http://localhost:11434";
    try {
      const url = new URL(`${API_URL}/ai/status`);
      url.searchParams.set('url', ollamaUrl);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      setOllamaAvailable(data.available);
      setOllamaModels(data.models || []);
      
      if (!data.available) {
        console.warn(`[Ollama] Not available at ${ollamaUrl}. Make sure Ollama is running.`);
      }
    } catch (error) {
      console.error(`[Ollama] Failed to check status at ${ollamaUrl}:`, error);
      setOllamaAvailable(false);
      setOllamaModels([]);
    }
  };

  const handleUseAIToggle = async (checked: boolean) => {
    if (checked && !ollamaAvailable) {
      toast({
        title: "Ollama Not Available",
        description: "Please install Ollama to use AI features.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateSettings("use_ai", checked);
      toast({
        title: "Settings Saved",
        description: `AI features ${checked ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setSaving(true);
    try {
      await updateSettings("ollama_model", model);
      toast({
        title: "Model Updated",
        description: `Now using ${model}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update model.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all tasks
      const tasksResponse = await fetch(`${API_URL}/tasks/`);
      const tasks = await tasksResponse.json();

      // Fetch all settings
      const settingsResponse = await fetch(`${API_URL}/settings/`);
      const settings = await settingsResponse.json();

      // Create export data
      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        tasks: tasks,
        settings: settings,
      };

      // Create download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trak-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: `Successfully exported ${tasks.length} tasks.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate data structure
      if (!importData.tasks || !Array.isArray(importData.tasks)) {
        throw new Error("Invalid data format");
      }

      // Import tasks
      let importedCount = 0;
      for (const task of importData.tasks) {
        try {
          await fetch(`${API_URL}/tasks/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              category: task.category,
              tags: task.tags || [],
            }),
          });
          importedCount++;
        } catch (error) {
          console.error("Failed to import task:", error);
        }
      }

      toast({
        title: "Data Imported",
        description: `Successfully imported ${importedCount} tasks.`,
      });

      // Reload page to refresh data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      event.target.value = ""; // Reset file input
    }
  };

  const handleClearAllData = async () => {
    try {
      // Fetch all tasks
      await fetchTasks();
      const allTasks = useStore.getState().tasks;

      // Delete all tasks
      for (const task of allTasks) {
        await deleteTask(task.id);
      }

      toast({
        title: "All Data Cleared",
        description: `Deleted ${allTasks.length} tasks.`,
      });

      setShowClearDialog(false);
    } catch (error) {
      console.error("Clear failed:", error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear all data.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure your TRAK experience
        </p>
      </div>

      <div className="space-y-6">
        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
            <CardDescription>
              Use AI to automatically generate task titles, categories, and summaries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ollama Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {ollamaAvailable === null ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : ollamaAvailable ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium">Ollama Status</p>
                  <p className="text-sm text-muted-foreground">
                    {ollamaAvailable === null
                      ? "Checking..."
                      : ollamaAvailable
                      ? "Connected and running"
                      : "Not detected"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkOllamaStatus}
                disabled={ollamaAvailable === null}
              >
                Refresh
              </Button>
            </div>

            {/* Use AI Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="use-ai">Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  {ollamaAvailable
                    ? "Automatically generate titles, categories, and summaries"
                    : "Install Ollama to use AI features"}
                </p>
              </div>
              <Switch
                id="use-ai"
                checked={useAI}
                onCheckedChange={handleUseAIToggle}
                disabled={saving || !ollamaAvailable}
              />
            </div>

            {/* Model Selection */}
            {ollamaAvailable && ollamaModels.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="model-select">AI Model</Label>
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={saving || !useAI}
                >
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({(model.size / 1024 / 1024 / 1024).toFixed(1)} GB)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose which Ollama model to use for AI features
                </p>
              </div>
            )}

            {!ollamaAvailable && (
              <div className="p-4 bg-accent/50 rounded-lg border">
                <p className="text-sm font-medium mb-2">How to install Ollama:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Visit <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">ollama.ai</a></li>
                  <li>Download and install Ollama for your system</li>
                  <li>Run: <code className="bg-muted px-1 py-0.5 rounded">ollama pull mistral</code></li>
                  <li>Restart TRAK and enable AI features</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Behavior */}
        <Card>
          <CardHeader>
            <CardTitle>App Behavior</CardTitle>
            <CardDescription>
              Customize how TRAK behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Close to Tray Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="close-to-tray">Close to System Tray</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, clicking close will minimize to system tray instead of quitting
                </p>
              </div>
              <Switch
                id="close-to-tray"
                checked={settings.close_to_tray}
                onCheckedChange={async (checked) => {
                  setSaving(true);
                  try {
                    await updateSettings("close_to_tray", checked);
                    toast({
                      title: "Settings Saved",
                      description: `Close button will ${checked ? "minimize to tray" : "quit the app"}.`,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save settings.",
                      variant: "destructive",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export, import, or clear your tracking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export */}
            <div className="space-y-2">
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Download all your tasks and settings as a JSON file
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>

            {/* Import */}
            <div className="space-y-2">
              <Label>Import Data</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Import tasks from a previously exported JSON file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>

            {/* Clear All */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-destructive">Danger Zone</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Permanently delete all tasks and tracking data. This cannot be undone.
              </p>
              <Button
                onClick={() => setShowClearDialog(true)}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About TRAK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Version:</span> 1.0.0</p>
              <p><span className="font-medium">Description:</span> AI-Powered Time Tracking Application</p>
              <p className="text-muted-foreground">
                TRAK helps you track your time efficiently with optional AI-powered features
                for automatic categorization and insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your tasks and tracking data. This action cannot be undone.
              <br /><br />
              <strong>Consider exporting your data first!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;


import { create } from 'zustand';

const API_URL = 'http://127.0.0.1:8000';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  start_time: string;
  end_time: string | null;
  duration: number | null;
  created_at: string;
}

interface TimerState {
  startTime: number | null;
  pausedTime: number;
}

export interface Stats {
  today: {
    tasks_count: number;
    total_time: number;
    breaks: number;
  };
  allTime: {
    tasks_count: number;
    total_time: number;
  };
}

export interface Settings {
  use_ai: boolean;
  ollama_model: string;
  ollama_url: string;
  close_to_tray: boolean;
}

interface StoreState {
  // Tasks
  tasks: Task[];
  currentTask: Task | null;
  isTimerRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  timerState: TimerState;
  
  // Stats
  stats: Stats;
  
  // Settings
  settings: Settings;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  fetchTasks: () => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  createTask: (title: string, description?: string) => Promise<Task | null>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  stopTask: (id: number) => Promise<void>;
  updateSettings: (key: string, value: any) => Promise<void>;
  
  // Timer actions
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setElapsedSeconds: (seconds: number) => void;
  resetTimer: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  isTimerRunning: false,
  isPaused: false,
  elapsedSeconds: 0,
  timerState: { startTime: null, pausedTime: 0 },
  stats: {
    today: { tasks_count: 0, total_time: 0, breaks: 0 },
    allTime: { tasks_count: 0, total_time: 0 },
  },
  settings: {
    use_ai: false,
    ollama_model: 'mistral:7b-instruct-q4_0',
    ollama_url: 'http://localhost:11434',
    close_to_tray: true,
  },
  isLoading: false,

  // Fetch all tasks
  fetchTasks: async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasks = await response.json();
      set({ tasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  },

  // Fetch today's tasks
  fetchTodayTasks: async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/today`);
      if (!response.ok) throw new Error('Failed to fetch today tasks');
      const tasks = await response.json();
      set({ tasks });
    } catch (error) {
      console.error('Failed to fetch today tasks:', error);
    }
  },

  // Fetch stats
  fetchStats: async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/stats/summary`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const stats = await response.json();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  // Fetch settings
  fetchSettings: async () => {
    try {
      const response = await fetch(`${API_URL}/settings/`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const settingsData = await response.json();
      
      // Convert string "true"/"false" to boolean for use_ai and close_to_tray
      const settings: Settings = {
        use_ai: settingsData.use_ai === "true",
        ollama_model: settingsData.ollama_model || 'mistral:7b-instruct-q4_0',
        ollama_url: settingsData.ollama_url || 'http://localhost:11434',
        close_to_tray: settingsData.close_to_tray !== "false", // Default to true
      };
      
      set({ settings });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  // Create task
  createTask: async (title: string, description?: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          category: null,
          tags: [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const task: Task = await response.json();
      
      // Update state
      set({
        currentTask: task,
        isTimerRunning: true,
        isPaused: false,
        elapsedSeconds: 0,
        timerState: { startTime: Date.now(), pausedTime: 0 },
      });
      
      // Refresh tasks and stats
      get().fetchTodayTasks();
      get().fetchStats();
      
      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  },

  // Update task
  updateTask: async (id: number, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      
      // Refresh tasks and stats
      get().fetchTodayTasks();
      get().fetchStats();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      
      // Refresh tasks and stats
      get().fetchTodayTasks();
      get().fetchStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  // Stop task
  stopTask: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/stop`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to stop task');
      
      // Reset timer state
      set({
        currentTask: null,
        isTimerRunning: false,
        isPaused: false,
        elapsedSeconds: 0,
        timerState: { startTime: null, pausedTime: 0 },
      });
      
      // Refresh tasks and stats
      get().fetchTodayTasks();
      get().fetchStats();
    } catch (error) {
      console.error('Failed to stop task:', error);
      throw error;
    }
  },

  // Update settings
  updateSettings: async (key: string, value: any) => {
    try {
      // Convert boolean to string for API
      const apiValue = typeof value === 'boolean' ? value.toString() : value;
      
      await fetch(`${API_URL}/settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: apiValue }),
      });
      
      // Update local settings
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Timer actions
  startTimer: () => set({ isTimerRunning: true, isPaused: false, timerState: { startTime: Date.now(), pausedTime: 0 } }),
  stopTimer: () => set({ isTimerRunning: false, isPaused: false, elapsedSeconds: 0, timerState: { startTime: null, pausedTime: 0 } }),
  pauseTimer: () => {
    const state = get();
    const currentElapsed = state.timerState.startTime 
      ? Math.floor((Date.now() - state.timerState.startTime) / 1000) - state.timerState.pausedTime
      : 0;
    set({ isPaused: true, elapsedSeconds: currentElapsed });
  },
  resumeTimer: () => {
    const state = get();
    const pauseStart = Date.now();
    set((state) => ({ 
      isPaused: false,
      timerState: { 
        ...state.timerState, 
        pausedTime: state.timerState.pausedTime + Math.floor((pauseStart - (state.timerState.startTime || pauseStart)) / 1000)
      }
    }));
  },
  setElapsedSeconds: (seconds: number) => set({ elapsedSeconds: seconds }),
  resetTimer: () => set({ elapsedSeconds: 0, isTimerRunning: false, isPaused: false, timerState: { startTime: null, pausedTime: 0 } }),
}));


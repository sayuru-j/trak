# Trak - AI-Powered Time Tracker

A local time tracking application built with Electron, React, FastAPI, SQLite, and Ollama.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- pip

### Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

### Running the App

#### Development Mode

1. **Start the frontend dev server (Terminal 1):**
```bash
npm run frontend:dev
```

2. **Start Electron (Terminal 2):**
```bash
npm start
```

> The Electron app will load from the Vite dev server with hot-reload support!

#### Production Mode

1. **Build the frontend:**
```bash
npm run build
```

2. **Run the app:**
```bash
npm run electron:prod
```

## 📁 Project Structure

```
trak/
├── frontend/              # Vite + React + TypeScript + shadcn/ui
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── ui/      # shadcn/ui components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── TitleBar.tsx  # Custom window controls
│   │   ├── pages/
│   │   │   └── Index.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── electron/              # Electron app
│   ├── main.js           # Main process
│   └── preload.js        # Preload script
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI entry point
│   ├── routes/          # API routes
│   └── utils/           # Utilities (Ollama client, etc.)
├── package.json
└── requirements.txt
```

## 🧪 Testing

Once the app starts:
1. The Electron window will open with custom title bar
2. The FastAPI backend runs on `http://127.0.0.1:8765`
3. The Vite dev server runs on `http://localhost:5173`
4. Navigate between Today, Timeline, and Analytics tabs

## 🛠️ Tech Stack

- **Frontend:** Electron + Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** FastAPI + Python
- **Database:** SQLite (coming soon)
- **AI:** Ollama with Mistral 7B (coming soon)

## 🎨 Features

### Core Features
- ✅ **System Tray Integration** - Runs in background, always accessible
- ✅ **Quick Add Popup** - Toggl-like quick task entry (`Ctrl+Shift+A`)
- ✅ Custom window controls (minimize, maximize, close)
- ✅ Frameless window with draggable title bar
- ✅ Modern UI with shadcn/ui components
- ✅ Dark/Light theme support (system sync)
- ✅ Dashboard, Timeline, and Analytics views
- ✅ FastAPI backend with SQLite database
- ✅ Real-time statistics and tracking
- ✅ Global keyboard shortcuts

### AI-Powered Features (Optional - Requires Ollama)
- ✅ **Smart Task Creation** - Describe your work naturally, AI generates clean titles
- ✅ **Auto-Generated Descriptions** - Your input becomes the task description
- ✅ **Best Practice Titles** - AI follows task naming conventions
- ✅ **Intelligent Processing** - Automatic fallback if AI unavailable
- 🔄 Daily summaries (coming soon)
- 🔄 Category suggestions (coming soon)

### How AI Task Creation Works:
1. **You type:** "working on the homepage redesign for the client"
2. **AI generates:** Title: "Design Homepage for Client"
3. **Saved as:** 
   - Title: "Design Homepage for Client"
   - Description: "working on the homepage redesign for the client"
4. **Starts tracking immediately!**

## 🚀 Quick Start Guide

### **System Tray**
- **Minimize** → Hides to system tray
- **Close** → Stays running in tray
- **Click tray** → Opens quick add popup
- **Double-click tray** → Shows main window
- **Right-click tray** → Shows menu

### **Quick Add Popup**
- **`Ctrl+Shift+A`** (Windows/Linux) or **`Cmd+Shift+A`** (Mac) → Opens quick add
- Type your task → AI generates clean title → Press Enter → Start tracking!
- **`Esc`** to close
- Auto-closes after adding task

### **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+Shift+A` | Open Quick Add anywhere |
| `Esc` | Close Quick Add |
| `Enter` | Submit task |


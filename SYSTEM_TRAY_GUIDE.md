# 📍 System Tray & Quick Add Guide

## Overview

TRAK now runs in your system tray, allowing you to minimize it to the background and quickly add tasks without opening the main window!

## 🎯 Key Features

### 1. **System Tray Integration**
- ✅ Minimize to tray instead of taskbar
- ✅ Always accessible in the background
- ✅ No clutter in your taskbar
- ✅ Never accidentally close and lose tracking

### 2. **Quick Add Window**
- ✅ Small, focused popup for adding tasks
- ✅ Appears near your cursor or tray
- ✅ Always on top
- ✅ Auto-closes after adding task
- ✅ AI-powered title generation (if enabled)

## 🖱️ How to Use

### **System Tray Interactions**

#### **Single Click (Left Click)**
```
Tray Icon → Quick Add Window Opens
```
- Opens the quick add popup
- Positioned in bottom-right corner
- Ready for immediate input

#### **Double Click**
```
Tray Icon (Double Click) → Main Window Shows
```
- Opens the full TRAK application
- Restores from minimized state

#### **Right Click**
```
Tray Icon (Right Click) → Context Menu
```
Menu options:
- **Quick Add Task** - Opens quick add popup
- **Show TRAK** - Opens main window
- **Quit** - Closes app completely

### **Quick Add Window**

#### **Open Methods**
1. **Click tray icon** (single click)
2. **Keyboard shortcut**: `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)
3. **Tray context menu** → "Quick Add Task"

#### **Using Quick Add**
1. Window appears in bottom-right corner
2. Type your task description
3. Press `Enter` or click "Start"
4. Task is created and tracking begins
5. Window automatically closes

#### **Closing Quick Add**
- Press `Esc` key
- Click anywhere outside the window
- Click the `X` button
- Click "Cancel"

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` (Win/Linux) | Open Quick Add |
| `Cmd+Shift+A` (Mac) | Open Quick Add |
| `Esc` | Close Quick Add |
| `Enter` | Submit task |

## 🎨 Quick Add Window Features

### **Window Specs**
- **Size**: 400x250px
- **Position**: Bottom-right corner
- **Style**: Transparent, frameless, always on top
- **Behavior**: Auto-hides on blur

### **Visual Indicators**
- 🟢 **Pulsing dot** - App is active
- ✨ **Sparkle icon** - AI is enabled
- ⏳ **Spinner** - Processing AI request

### **Smart Behavior**
1. **Auto-focus** - Input field is ready immediately
2. **AI processing** - Shows loading state
3. **Error handling** - Falls back to manual if AI fails
4. **Success feedback** - Toast notification shown
5. **Auto-close** - Closes 1 second after task created

## 🔄 Minimize Behavior

### **When You Minimize TRAK**
```
Click Minimize Button → Hides to Tray
```
- Main window hides (not minimized to taskbar)
- App continues running in background
- Timer keeps tracking
- Tray icon remains visible

### **When You Close TRAK**
```
Click Close Button → Hides to Tray
```
- Window closes but app stays running
- Access via tray icon
- All tasks continue tracking

### **To Truly Quit**
1. Right-click tray icon
2. Select "Quit"
3. Or close main window after selecting Quit from menu

## 💡 Usage Examples

### **Example 1: Quick Task Entry**
```
1. Press Ctrl+Shift+A anywhere
2. Type: "fixing login bug"
3. AI generates: "Fix Login Bug"
4. Press Enter
5. Window closes, task starts tracking
```

### **Example 2: Background Operation**
```
1. Working on multiple tasks
2. Minimize TRAK to tray
3. Continue working
4. Need to add new task:
   - Click tray icon
   - Add task in popup
   - Continue working
5. Open main window when needed
```

### **Example 3: Always Available**
```
1. TRAK runs in background
2. Use Ctrl+Shift+A anytime to add tasks
3. No need to switch windows
4. Seamless task tracking
```

## 🛠️ Technical Details

### **Tray Icon**
- Format: PNG (32x32)
- Currently: Base64 embedded
- Can be replaced with custom icon file
- Shows on all platforms

### **Quick Add Window**
- Framework: Electron BrowserWindow
- Frameless: No title bar or borders
- Transparent: Rounded corners with shadow
- Always on top: Stays above other windows
- Skip taskbar: Doesn't appear in Alt+Tab

### **Global Shortcut**
- Registered on app start
- Works system-wide (even when app is hidden)
- Unregistered on app quit
- Platform-aware (Ctrl/Cmd)

## 🎯 Best Practices

### **For Quick Task Entry**
1. Keep TRAK minimized to tray
2. Use `Ctrl+Shift+A` for instant access
3. Describe tasks naturally
4. Let AI clean up the title
5. Continue working immediately

### **For Long Sessions**
1. Start main timer
2. Minimize to tray
3. Use quick add for breaks/new tasks
4. Check main window periodically for stats

### **For Multi-tasking**
1. Use quick add between tasks
2. No need to open main window
3. Track everything without interruption
4. Review timeline at end of day

## 🔧 Customization (Future)

Ideas for future enhancements:
- [ ] Custom tray icon
- [ ] Configurable keyboard shortcut
- [ ] Quick add window themes
- [ ] Position preferences
- [ ] Auto-hide timer settings
- [ ] Notification on task complete

## 🐛 Troubleshooting

### **Quick Add doesn't open**
- Check if shortcut is registered (see console)
- Try clicking tray icon instead
- Restart TRAK

### **Can't find tray icon**
- Check system tray area
- Look in hidden icons (^) on Windows
- Check if process is running

### **Window appears in wrong position**
- Window positions based on cursor/display
- Adjust by moving to desired location
- Position calculated automatically

### **Keyboard shortcut conflicts**
- `Ctrl+Shift+A` might be used by another app
- Close conflicting app or change TRAK shortcut

## 📊 Comparison with Toggl Tracker

| Feature | TRAK | Toggl |
|---------|------|-------|
| System Tray | ✅ | ✅ |
| Quick Add Popup | ✅ | ✅ |
| Global Shortcut | ✅ | ✅ |
| AI Title Generation | ✅ | ❌ |
| Always on Top | ✅ | ✅ |
| Auto-close | ✅ | ✅ |
| Offline-first | ✅ | ❌ |

## 🎉 Benefits

### **Productivity**
- ⚡ Instant access from anywhere
- 🎯 No window switching needed
- 🚀 Faster task entry
- 💡 Less context switching

### **Convenience**
- 📍 Always available in tray
- 🖱️ One click access
- ⌨️ Keyboard shortcut
- 🎨 Clean, minimal UI

### **Background Operation**
- 🔄 Runs in background
- 💾 Never lose tracking
- 🌐 Always accessible
- 🎯 Out of the way when not needed


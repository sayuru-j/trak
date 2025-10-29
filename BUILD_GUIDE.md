# TRAK - Build & Deployment Guide

## 📦 Building the Application

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Build Commands

#### Build for Current Platform
```bash
npm run dist
```

#### Build for Specific Platforms
```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

### Build Output

The built applications will be in the `dist` folder:
- **Windows**: `TRAK Setup.exe` (installer) and `TRAK Portable.exe`
- **macOS**: `TRAK.dmg` and `TRAK.app.zip`
- **Linux**: `TRAK.AppImage` and `trak_1.0.0_amd64.deb`

---

## 🚀 Deployment Options

### Option 1: Local Installation

1. **Build the app**: `npm run dist:win` (or your platform)
2. **Run the installer** from the `dist` folder
3. **Launch TRAK** from Start Menu/Applications

### Option 2: Portable Version (Windows)

1. Build: `npm run dist:win`
2. Use `TRAK Portable.exe` - no installation needed
3. Can run from USB drive

### Option 3: Manual Deployment

If you want to deploy without building:

1. **Bundle the project**:
   ```bash
   # Build frontend
   cd frontend
   npm install
   npm run build
   cd ..
   
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   cd ..
   
   # Install root dependencies
   npm install
   ```

2. **Copy the entire folder** to target machine

3. **Run on target machine**:
   ```bash
   npm start
   ```

---

## 📋 System Requirements

### Development
- Node.js 18+
- Python 3.8+
- 2GB RAM minimum
- 500MB disk space

### End Users
- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.14+
- **Linux**: Ubuntu 18.04+, Fedora 32+, or equivalent
- Python 3.8+ (included in package)
- 1GB RAM minimum
- 300MB disk space

---

## 🔧 Configuration

### Backend Configuration

The backend runs on `http://127.0.0.1:8765` by default.

To change the port, edit `backend/main.py`:
```python
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
```

### Frontend Configuration

Frontend connects to backend via `window.api.apiUrl` (defined in Electron preload).

---

## 📦 What Gets Packaged

The built application includes:
- ✅ Electron frontend (React + TypeScript + Vite)
- ✅ FastAPI backend
- ✅ Python dependencies
- ✅ SQLite database (created on first run)
- ✅ Node.js runtime (embedded)
- ✅ All required libraries

---

## 🔒 Security Notes

### For Distribution:
1. **Code Signing** (Recommended for production):
   - Windows: Get a code signing certificate
   - macOS: Requires Apple Developer account
   - Prevents security warnings

2. **Update electron-builder config** for code signing:
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your_password"
},
"mac": {
  "identity": "Your Name (TEAM_ID)"
}
```

### Local Auth:
- Uses SHA-256 password hashing
- Session-based authentication with httpOnly cookies
- CORS restricted to localhost origins

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: `electron-builder` not found
```bash
npm install --save-dev electron-builder
```

**Issue**: Python not found during build
- Install Python 3.8+ and add to PATH
- Restart terminal after installation

### Runtime Issues

**Issue**: Backend doesn't start
- Check if port 8765 is available
- Check Python dependencies: `pip install -r backend/requirements.txt`

**Issue**: Database errors
- Delete `backend/trak.db` to reset database
- Restart the application

---

## 📊 Build Size

Approximate built application sizes:
- **Windows**: ~150-200 MB
- **macOS**: ~150-200 MB  
- **Linux**: ~150-200 MB

(Includes Node.js runtime, Python, and all dependencies)

---

## 🎯 Next Steps for Production

1. **Add App Icon**:
   - Place `icon.png` (512x512 or 1024x1024) in `build/` folder
   - electron-builder will auto-generate platform-specific icons

2. **Code Signing**:
   - Get certificates for Windows/macOS
   - Update `package.json` build config

3. **Auto-Updates** (Optional):
   - Use electron-updater
   - Set up update server

4. **Analytics** (Optional):
   - Add telemetry for crash reporting
   - Use services like Sentry

---

## 💡 Tips

- **First Build**: Takes 5-10 minutes (downloads dependencies)
- **Subsequent Builds**: 2-3 minutes
- **Cross-Platform**: Build on target OS for best results
- **Testing**: Test built app before distributing

---

## 📝 Changelog

### Version 1.0.0
- Initial release
- Local time tracking
- AI-powered task titles/descriptions (via Ollama)
- AI chat assistant
- Optional authentication
- System tray integration
- Quick add popup
- Export/Import data

---

## 🆘 Support

For issues or questions:
1. Check `README.md` for usage instructions
2. Review this guide for build/deployment help
3. Check terminal logs for error messages

---

**Built with ❤️ using Electron, React, FastAPI, and Ollama**


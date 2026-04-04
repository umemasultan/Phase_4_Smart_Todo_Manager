@echo off
echo ============================================================
echo Todo Chatbot - Development Server Setup
echo By Umema Sultan
echo ============================================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found:
node --version
echo.

echo [2/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [3/3] Starting development server...
echo.
echo ============================================================
echo Server will start at http://localhost:5000
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

node dev-server.js

pause

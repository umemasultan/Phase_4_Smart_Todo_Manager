@echo off
REM Phase 4 Deployment Script for Windows

echo ==========================================
echo Phase 4: Todo Chatbot Deployment
echo ==========================================

REM Step 1: Check Docker
echo.
echo Step 1: Checking Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo Docker is running

REM Step 2: Start Minikube
echo.
echo Step 2: Starting Minikube...
minikube.exe status | findstr "Running" >nul 2>&1
if errorlevel 1 (
    echo Starting Minikube...
    minikube.exe start --driver=docker --cpus=4 --memory=8192 --disk-size=20g
) else (
    echo Minikube is already running
)

echo Enabling addons...
minikube.exe addons enable metrics-server

REM Step 3: Build Images
echo.
echo Step 3: Building Docker images...
echo Building backend...
docker build -t todo-backend:latest ./backend/
echo Building frontend...
docker build -t todo-frontend:latest ./frontend/
echo Building database...
docker build -t todo-database:latest ./database/

REM Step 4: Load Images
echo.
echo Step 4: Loading images to Minikube...
minikube.exe image load todo-backend:latest
minikube.exe image load todo-frontend:latest
minikube.exe image load todo-database:latest

REM Step 5: Deploy with Helm
echo.
echo Step 5: Deploying with Helm...
kubectl get namespace todo-app >nul 2>&1
if errorlevel 1 (
    kubectl create namespace todo-app
)

helm.exe list -n todo-app | findstr "todo-chatbot-governed" >nul 2>&1
if errorlevel 1 (
    helm.exe install todo-chatbot-governed ./todo-chatbot-governed/ --namespace todo-app
) else (
    helm.exe upgrade todo-chatbot-governed ./todo-chatbot-governed/ --namespace todo-app
)

REM Step 6: Wait for pods
echo.
echo Step 6: Waiting for pods to be ready...
timeout /t 30 /nobreak

REM Step 7: Display status
echo.
echo ==========================================
echo Deployment Status
echo ==========================================
echo.
echo Pods:
kubectl get pods -n todo-app
echo.
echo Services:
kubectl get services -n todo-app
echo.

REM Step 8: Get URL
echo ==========================================
echo Access Application
echo ==========================================
echo.
echo Getting frontend URL...
minikube.exe service todo-frontend -n todo-app --url
echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
pause

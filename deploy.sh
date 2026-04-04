#!/bin/bash
# Complete Phase 4 Deployment Script

set -e

echo "=========================================="
echo "Phase 4: Todo Chatbot Deployment"
echo "=========================================="

# Step 1: Check Docker
echo ""
echo "Step 1: Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"

# Step 2: Start Minikube
echo ""
echo "Step 2: Starting Minikube..."
if ./minikube.exe status | grep -q "Running"; then
    echo "✅ Minikube is already running"
else
    echo "Starting Minikube with 4 CPUs, 8GB RAM, 20GB disk..."
    ./minikube.exe start --driver=docker --cpus=4 --memory=8192 --disk-size=20g
    echo "✅ Minikube started"
fi

# Enable addons
echo "Enabling Minikube addons..."
./minikube.exe addons enable metrics-server
echo "✅ Addons enabled"

# Step 3: Build Docker Images
echo ""
echo "Step 3: Building Docker images..."

echo "Building backend image..."
docker build -t todo-backend:latest ./backend/
echo "✅ Backend image built"

echo "Building frontend image..."
docker build -t todo-frontend:latest ./frontend/
echo "✅ Frontend image built"

echo "Building database image..."
docker build -t todo-database:latest ./database/
echo "✅ Database image built"

# Step 4: Load Images to Minikube
echo ""
echo "Step 4: Loading images to Minikube..."
./minikube.exe image load todo-backend:latest
./minikube.exe image load todo-frontend:latest
./minikube.exe image load todo-database:latest
echo "✅ Images loaded to Minikube"

# Step 5: Deploy with Helm
echo ""
echo "Step 5: Deploying with Helm..."

# Create namespace if not exists
if ! kubectl get namespace todo-app > /dev/null 2>&1; then
    kubectl create namespace todo-app
    echo "✅ Namespace created"
else
    echo "✅ Namespace already exists"
fi

# Install or upgrade Helm chart
if ./helm.exe list -n todo-app | grep -q "todo-chatbot-governed"; then
    echo "Upgrading existing Helm release..."
    ./helm.exe upgrade todo-chatbot-governed ./todo-chatbot-governed/ --namespace todo-app
else
    echo "Installing Helm chart..."
    ./helm.exe install todo-chatbot-governed ./todo-chatbot-governed/ --namespace todo-app
fi
echo "✅ Helm chart deployed"

# Step 6: Wait for pods to be ready
echo ""
echo "Step 6: Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=todo-frontend -n todo-app --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=todo-backend -n todo-app --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=todo-database -n todo-app --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=todo-redis -n todo-app --timeout=300s || true

# Step 7: Display status
echo ""
echo "=========================================="
echo "Deployment Status"
echo "=========================================="
echo ""
echo "Pods:"
kubectl get pods -n todo-app
echo ""
echo "Services:"
kubectl get services -n todo-app
echo ""
echo "Deployments:"
kubectl get deployments -n todo-app
echo ""

# Step 8: Get frontend URL
echo "=========================================="
echo "Access Application"
echo "=========================================="
echo ""
echo "Getting frontend URL..."
FRONTEND_URL=$(./minikube.exe service todo-frontend -n todo-app --url)
echo ""
echo "✅ Frontend URL: $FRONTEND_URL"
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open browser and visit: $FRONTEND_URL"
echo "2. Run validation: ./validation-script.sh"
echo "3. Check logs: kubectl logs -n todo-app -l app=todo-backend"
echo ""

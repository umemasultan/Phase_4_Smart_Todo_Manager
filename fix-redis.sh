#!/bin/bash
# Redis Fix Script for Phase IV
# Run this after restarting Docker Desktop

echo "=========================================="
echo "Redis Fix Script - Phase IV"
echo "=========================================="
echo ""

# Step 1: Check Docker
echo "Step 1: Checking Docker..."
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop and run this script again"
    exit 1
fi

echo ""

# Step 2: Pull Redis image
echo "Step 2: Pulling Redis image..."
docker pull redis:7-alpine
if [ $? -eq 0 ]; then
    echo "✅ Redis image pulled successfully"
else
    echo "❌ Failed to pull Redis image"
    exit 1
fi

echo ""

# Step 3: Load to Minikube
echo "Step 3: Loading Redis image to Minikube..."
/c/minikube/minikube.exe image load redis:7-alpine
if [ $? -eq 0 ]; then
    echo "✅ Redis image loaded to Minikube"
else
    echo "❌ Failed to load image to Minikube"
    exit 1
fi

echo ""

# Step 4: Delete Redis pod
echo "Step 4: Restarting Redis pod..."
kubectl delete pod -n todo-app -l app=todo-redis
if [ $? -eq 0 ]; then
    echo "✅ Redis pod deleted (will restart automatically)"
else
    echo "❌ Failed to delete Redis pod"
    exit 1
fi

echo ""

# Step 5: Wait for pods
echo "Step 5: Waiting for pods to be ready (30 seconds)..."
sleep 30

echo ""

# Step 6: Check status
echo "Step 6: Checking pod status..."
kubectl get pods -n todo-app

echo ""
echo "=========================================="
echo "Redis Fix Complete!"
echo "=========================================="
echo ""
echo "Check if all pods are running:"
echo "  kubectl get pods -n todo-app"
echo ""
echo "If Redis is still not running, check logs:"
echo "  kubectl logs -n todo-app -l app=todo-redis"
echo ""
echo "Access frontend:"
echo "  minikube service todo-frontend -n todo-app --url"
echo ""

# Quick Start Guide - Phase IV Deployment

**Last Updated:** 2026-04-24  
**Estimated Time:** 30-45 minutes  
**Difficulty:** Intermediate

---

## 🎯 Goal

Deploy the Todo Chatbot on local Kubernetes (Minikube) using Helm charts, following Phase IV requirements.

---

## ⚡ Prerequisites Installation (15-20 minutes)

### Step 1: Start Docker Desktop
```bash
# 1. Open Docker Desktop application from Start Menu
# 2. Wait for "Docker Desktop is running" message
# 3. Verify it's running:
docker ps
```

**Expected Output:** Empty list or running containers (no errors)

---

### Step 2: Install Minikube

**Option A: Using Chocolatey (Recommended)**
```bash
choco install minikube
```

**Option B: Manual Download**
```bash
# Download
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-windows-amd64.exe

# Install (Run PowerShell as Administrator)
Move-Item minikube-windows-amd64.exe C:\Windows\System32\minikube.exe
```

**Verify Installation:**
```bash
minikube version
```

---

### Step 3: Install Helm

**Option A: Using Chocolatey (Recommended)**
```bash
choco install kubernetes-helm
```

**Option B: Using Scoop**
```bash
scoop install helm
```

**Option C: Manual Download**
1. Download from: https://github.com/helm/helm/releases
2. Extract and add to PATH
3. Restart terminal

**Verify Installation:**
```bash
helm version
```

---

## 🚀 Deployment Steps (10-15 minutes)

### Step 4: Start Minikube Cluster
```bash
# Start with recommended resources
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify cluster is running
minikube status
```

**Expected Output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

### Step 5: Build Docker Images
```bash
# Navigate to project root
cd E:\Hackathon_2\Phase_4

# Build backend image
cd backend
docker build -t todo-backend:latest .
cd ..

# Build frontend image
cd frontend
docker build -t todo-frontend:latest .
cd ..

# Build database image
cd database
docker build -t todo-database:latest .
cd ..

# Verify images are built
docker images | grep todo-
```

**Expected Output:**
```
todo-backend     latest    <image-id>   <time>   <size>
todo-frontend    latest    <image-id>   <time>   <size>
todo-database    latest    <image-id>   <time>   <size>
```

---

### Step 6: Load Images into Minikube
```bash
# Load all three images
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
minikube image load todo-database:latest

# Verify images are loaded
minikube ssh docker images | grep todo-
```

---

### Step 7: Deploy with Helm
```bash
# Create namespace
kubectl create namespace todo-app

# Deploy the Helm chart
helm install todo-chatbot-governed ./todo-chatbot-governed \
  --namespace todo-app \
  --create-namespace

# Verify deployment
helm list -n todo-app
```

**Expected Output:**
```
NAME                    NAMESPACE  REVISION  STATUS    CHART                        APP VERSION
todo-chatbot-governed   todo-app   1         deployed  todo-chatbot-governed-1.0.0  1.1.0
```

---

### Step 8: Wait for Pods to Start
```bash
# Watch pods starting (Ctrl+C to exit)
kubectl get pods -n todo-app --watch

# Or check status once
kubectl get pods -n todo-app
```

**Expected Output (after 1-2 minutes):**
```
NAME                            READY   STATUS    RESTARTS   AGE
todo-backend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
todo-backend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
todo-database-xxxxxxxxx-xxxxx   1/1     Running   0          2m
todo-frontend-xxxxxxxxx-xxxxx   1/1     Running   0          2m
todo-frontend-xxxxxxxxx-xxxxx   1/1     Running   0          2m
todo-redis-xxxxxxxxx-xxxxx      1/1     Running   0          2m
```

---

### Step 9: Access the Application
```bash
# Get the frontend URL
minikube service todo-frontend -n todo-app --url
```

**Expected Output:**
```
http://192.168.49.2:30080
```

**Open this URL in your browser to access the Todo Chatbot!**

---

## ✅ Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check all pods are running
kubectl get pods -n todo-app

# 2. Check services are created
kubectl get services -n todo-app

# 3. Check deployments
kubectl get deployments -n todo-app

# 4. Check replica counts
kubectl get deployment todo-frontend -n todo-app -o jsonpath='{.spec.replicas}'  # Should be 2
kubectl get deployment todo-backend -n todo-app -o jsonpath='{.spec.replicas}'   # Should be 2

# 5. Check service types
kubectl get service todo-frontend -n todo-app -o jsonpath='{.spec.type}'  # Should be NodePort
kubectl get service todo-backend -n todo-app -o jsonpath='{.spec.type}'   # Should be ClusterIP

# 6. Check pod logs (if needed)
kubectl logs -n todo-app -l app=todo-backend --tail=50
kubectl logs -n todo-app -l app=todo-frontend --tail=50
```

---

## 🔧 Troubleshooting

### Problem: Pods stuck in "Pending" state
```bash
# Check events
kubectl describe pods -n todo-app

# Common fix: Increase Minikube resources
minikube stop
minikube start --driver=docker --cpus=4 --memory=8192
```

### Problem: Pods in "ImagePullBackOff"
```bash
# Verify images are loaded
minikube ssh docker images | grep todo-

# If missing, reload images
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
minikube image load todo-database:latest
```

### Problem: Pods in "CrashLoopBackOff"
```bash
# Check logs for errors
kubectl logs -n todo-app <pod-name>

# Check pod details
kubectl describe pod -n todo-app <pod-name>
```

### Problem: Cannot access frontend URL
```bash
# Check if service exists
kubectl get service todo-frontend -n todo-app

# Get Minikube IP
minikube ip

# Try accessing: http://<minikube-ip>:30080
```

### Problem: Backend connection errors
```bash
# Check if database is running
kubectl get pods -n todo-app | grep database

# Check backend logs
kubectl logs -n todo-app -l app=todo-backend

# Verify environment variables
kubectl describe deployment todo-backend -n todo-app | grep -A 10 Environment
```

---

## 🧹 Cleanup (Optional)

To remove the deployment:

```bash
# Uninstall Helm release
helm uninstall todo-chatbot-governed -n todo-app

# Delete namespace
kubectl delete namespace todo-app

# Stop Minikube (optional)
minikube stop

# Delete Minikube cluster (optional - removes all data)
minikube delete
```

---

## 📊 Run Full Validation

After deployment, run the comprehensive validation script:

```bash
chmod +x validation-script.sh
./validation-script.sh
```

This will check all 18 Phase IV requirements and give you a detailed report.

---

## 🎓 Next Steps

### Optional: Install AI Tools

**kubectl-ai** (Natural language Kubernetes commands)
```bash
# Install Go first (if not installed)
# Then install kubectl-ai
go install github.com/sozercan/kubectl-ai@latest

# Usage examples
kubectl-ai "show me all pods in todo-app namespace"
kubectl-ai "scale backend to 3 replicas"
```

**Kagent** (Cluster analysis)
```bash
# Installation instructions
# Visit: https://github.com/kubeshop/kagent

# Usage examples
kagent "analyze cluster health"
kagent "optimize resource allocation"
```

**Docker AI (Gordon)**
```bash
# Enable in Docker Desktop
# Settings > Beta features > Enable Docker AI

# Usage examples
docker ai "What can you do?"
docker ai "optimize my Dockerfile"
```

---

## 📚 Additional Resources

- **Full Compliance Report:** `PHASE_IV_COMPLIANCE_REPORT.md`
- **Detailed Deployment Guide:** `DEPLOYMENT_COMPLETION_GUIDE.md`
- **Validation Script:** `validation-script.sh`
- **Blueprint Specification:** `blueprint.yaml`
- **Governance Summary:** `GOVERNANCE_SUMMARY.md`

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review pod logs: `kubectl logs -n todo-app <pod-name>`
3. Check pod events: `kubectl describe pod -n todo-app <pod-name>`
4. Verify Minikube status: `minikube status`
5. Check Docker is running: `docker ps`

---

**Deployment Time Breakdown:**
- Prerequisites Installation: 15-20 minutes
- Minikube Start: 3-5 minutes
- Image Building: 5-7 minutes
- Helm Deployment: 2-3 minutes
- Pod Startup: 1-2 minutes

**Total:** ~30-45 minutes for first-time setup

---

**Good luck with your deployment! 🚀**

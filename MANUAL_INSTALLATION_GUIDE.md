# Manual Installation Guide (Urdu/English)

## Prerequisites Installation Failed - Manual Steps Required

Chocolatey installation fail ho gayi. Yeh manual steps follow karein:

---

## Step 1: Docker Desktop (CRITICAL)

**Status:** Installed but NOT running

**Action:**
1. Windows Start Menu kholen
2. "Docker Desktop" search karein
3. Application ko open karein
4. Wait karein jab tak "Docker Desktop is running" message na dikhe
5. Verify: Open terminal and run `docker ps`

**Time:** 2-3 minutes

---

## Step 2: Minikube Installation (CRITICAL)

**Option A: Using PowerShell (Recommended)**

Open PowerShell as Administrator and run:

```powershell
New-Item -Path 'c:\' -Name 'minikube' -ItemType Directory -Force
Invoke-WebRequest -OutFile 'c:\minikube\minikube.exe' -Uri 'https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe' -UseBasicParsing

$oldPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::Machine)
if ($oldPath.Split(';') -inotcontains 'C:\minikube'){
  [Environment]::SetEnvironmentVariable('Path', $('{0};C:\minikube' -f $oldPath), [EnvironmentVariableTarget]::Machine)
}
```

**Option B: Manual Download**

1. Download: https://storage.googleapis.com/minikube/releases/latest/minikube-windows-amd64.exe
2. Rename file to: `minikube.exe`
3. Create folder: `C:\minikube\`
4. Move `minikube.exe` to `C:\minikube\`
5. Add `C:\minikube` to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add new entry: `C:\minikube`
6. Restart terminal

**Verify:**
```bash
minikube version
```

**Time:** 5-10 minutes

---

## Step 3: Helm Installation (CRITICAL)

**Option A: Using PowerShell (Recommended)**

Open PowerShell as Administrator and run:

```powershell
# Download Helm
Invoke-WebRequest -Uri "https://get.helm.sh/helm-v3.14.0-windows-amd64.zip" -OutFile "helm.zip"

# Extract
Expand-Archive -Path "helm.zip" -DestinationPath "C:\helm" -Force

# Add to PATH
$oldPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::Machine)
if ($oldPath.Split(';') -inotcontains 'C:\helm\windows-amd64'){
  [Environment]::SetEnvironmentVariable('Path', $('{0};C:\helm\windows-amd64' -f $oldPath), [EnvironmentVariableTarget]::Machine)
}

# Cleanup
Remove-Item "helm.zip"
```

**Option B: Manual Download**

1. Download: https://github.com/helm/helm/releases/download/v3.14.0/helm-v3.14.0-windows-amd64.zip
2. Extract the ZIP file
3. Create folder: `C:\helm\`
4. Move `helm.exe` to `C:\helm\`
5. Add `C:\helm` to PATH (same as Minikube)
6. Restart terminal

**Verify:**
```bash
helm version
```

**Time:** 5-10 minutes

---

## Quick Verification Script

After installation, restart terminal and run:

```bash
# Check all tools
echo "=== Checking Prerequisites ==="
echo ""
echo "1. Docker:"
docker --version && docker ps

echo ""
echo "2. Minikube:"
minikube version

echo ""
echo "3. Helm:"
helm version

echo ""
echo "4. kubectl:"
kubectl version --client
```

---

## Total Time Required

- Docker Desktop start: 2-3 minutes
- Minikube install: 5-10 minutes  
- Helm install: 5-10 minutes
- **Total: 15-25 minutes**

---

## Next Steps After Installation

Once all tools are installed:

1. Start Minikube:
   ```bash
   minikube start --driver=docker --cpus=4 --memory=8192
   ```

2. Build Docker images:
   ```bash
   cd backend && docker build -t todo-backend:latest . && cd ..
   cd frontend && docker build -t todo-frontend:latest . && cd ..
   cd database && docker build -t todo-database:latest . && cd ..
   ```

3. Load images to Minikube:
   ```bash
   minikube image load todo-backend:latest
   minikube image load todo-frontend:latest
   minikube image load todo-database:latest
   ```

4. Deploy with Helm:
   ```bash
   helm install todo-chatbot-governed ./todo-chatbot-governed -n todo-app --create-namespace
   ```

5. Get application URL:
   ```bash
   minikube service todo-frontend -n todo-app --url
   ```

---

## Troubleshooting

### Minikube not found after installation
- Restart terminal
- Check PATH: `echo $env:PATH` (PowerShell) or `echo $PATH` (Git Bash)
- Manually add to PATH if missing

### Helm not found after installation
- Restart terminal
- Check PATH
- Verify helm.exe exists in installation folder

### Docker daemon not running
- Open Docker Desktop application
- Wait for it to fully start
- Check system tray for Docker icon

---

**File Created:** 2026-04-24
**Purpose:** Manual installation guide when Chocolatey fails

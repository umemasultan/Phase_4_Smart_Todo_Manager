#!/bin/bash
# Phase IV Prerequisites Installation Script
# Generated: 2026-04-24
# Purpose: Automated installation of Minikube and Helm on Windows (Git Bash)

set -e  # Exit on error

echo "=========================================================="
echo "Phase IV Prerequisites Installation Script"
echo "=========================================================="
echo ""
echo "This script will help you install:"
echo "  1. Minikube (Kubernetes cluster)"
echo "  2. Helm (Package manager)"
echo ""
echo "Prerequisites:"
echo "  - Docker Desktop must be installed and running"
echo "  - Chocolatey package manager (recommended)"
echo "  - Administrator privileges"
echo ""
echo "=========================================================="
echo ""

# Check if running on Windows
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    echo "❌ This script is designed for Windows (Git Bash)"
    echo "Please run on Windows with Git Bash"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker
echo "Step 1: Checking Docker Desktop..."
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker installed: $DOCKER_VERSION"

    # Check if Docker daemon is running
    if docker ps >/dev/null 2>&1; then
        echo "✅ Docker daemon is running"
    else
        echo "❌ Docker daemon is NOT running"
        echo "   Please start Docker Desktop and run this script again"
        exit 1
    fi
else
    echo "❌ Docker is not installed"
    echo "   Please install Docker Desktop first"
    exit 1
fi

echo ""

# Check Chocolatey
echo "Step 2: Checking Chocolatey..."
if command_exists choco; then
    CHOCO_VERSION=$(choco --version)
    echo "✅ Chocolatey installed: $CHOCO_VERSION"
    INSTALL_METHOD="choco"
else
    echo "⚠️  Chocolatey not found"
    echo "   Will provide manual installation instructions"
    INSTALL_METHOD="manual"
fi

echo ""

# Check/Install Minikube
echo "Step 3: Checking Minikube..."
if command_exists minikube; then
    MINIKUBE_VERSION=$(minikube version --short)
    echo "✅ Minikube already installed: $MINIKUBE_VERSION"
else
    echo "❌ Minikube not found"

    if [ "$INSTALL_METHOD" = "choco" ]; then
        echo "Installing Minikube via Chocolatey..."
        echo "This requires administrator privileges"
        echo ""
        read -p "Install Minikube now? (y/n): " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Running: choco install minikube -y"
            choco install minikube -y

            if command_exists minikube; then
                echo "✅ Minikube installed successfully"
            else
                echo "❌ Minikube installation failed"
                echo "   Please restart your terminal and try again"
            fi
        else
            echo "⚠️  Skipping Minikube installation"
        fi
    else
        echo ""
        echo "Manual Installation Instructions for Minikube:"
        echo "1. Download from: https://storage.googleapis.com/minikube/releases/latest/minikube-windows-amd64.exe"
        echo "2. Rename to: minikube.exe"
        echo "3. Move to: C:\\Windows\\System32\\"
        echo "4. Restart terminal"
        echo ""
    fi
fi

echo ""

# Check/Install Helm
echo "Step 4: Checking Helm..."
if command_exists helm; then
    HELM_VERSION=$(helm version --short)
    echo "✅ Helm already installed: $HELM_VERSION"
else
    echo "❌ Helm not found"

    if [ "$INSTALL_METHOD" = "choco" ]; then
        echo "Installing Helm via Chocolatey..."
        echo "This requires administrator privileges"
        echo ""
        read -p "Install Helm now? (y/n): " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Running: choco install kubernetes-helm -y"
            choco install kubernetes-helm -y

            if command_exists helm; then
                echo "✅ Helm installed successfully"
            else
                echo "❌ Helm installation failed"
                echo "   Please restart your terminal and try again"
            fi
        else
            echo "⚠️  Skipping Helm installation"
        fi
    else
        echo ""
        echo "Manual Installation Instructions for Helm:"
        echo "1. Download from: https://github.com/helm/helm/releases"
        echo "2. Extract the archive"
        echo "3. Add helm.exe to your PATH"
        echo "4. Restart terminal"
        echo ""
    fi
fi

echo ""

# Check kubectl
echo "Step 5: Checking kubectl..."
if command_exists kubectl; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client)
    echo "✅ kubectl installed: $KUBECTL_VERSION"
else
    echo "⚠️  kubectl not found"
    echo "   kubectl is usually installed with Docker Desktop"
    echo "   Check: C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe"
fi

echo ""
echo "=========================================================="
echo "Prerequisites Check Complete"
echo "=========================================================="
echo ""

# Summary
echo "Summary:"
echo "--------"

READY=true

if command_exists docker && docker ps >/dev/null 2>&1; then
    echo "✅ Docker Desktop: Running"
else
    echo "❌ Docker Desktop: Not running"
    READY=false
fi

if command_exists minikube; then
    echo "✅ Minikube: Installed"
else
    echo "❌ Minikube: Not installed"
    READY=false
fi

if command_exists helm; then
    echo "✅ Helm: Installed"
else
    echo "❌ Helm: Not installed"
    READY=false
fi

if command_exists kubectl; then
    echo "✅ kubectl: Installed"
else
    echo "⚠️  kubectl: Not found (optional)"
fi

echo ""

if [ "$READY" = true ]; then
    echo "🎉 All prerequisites are installed!"
    echo ""
    echo "Next steps:"
    echo "1. Start Minikube: minikube start --driver=docker --cpus=4 --memory=8192"
    echo "2. Build Docker images"
    echo "3. Deploy with Helm"
    echo ""
    echo "See QUICK_START_GUIDE.md for detailed instructions"
else
    echo "⚠️  Some prerequisites are missing"
    echo ""
    echo "Please install missing components and run this script again"
    echo ""
    echo "If you just installed something, restart your terminal first"
fi

echo ""
echo "=========================================================="

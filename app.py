import os
import subprocess
import sys
from pathlib import Path

# Install Node.js dependencies
print("Installing dependencies...")
subprocess.run(["npm", "install"], cwd=str(Path(__file__).parent / "api"), check=True)

# Start the Node.js API server
print("Starting Todo Chatbot API...")
subprocess.run(["node", "app/index.js"], cwd=str(Path(__file__).parent / "api"))

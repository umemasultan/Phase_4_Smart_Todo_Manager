import os
import subprocess
import threading
from pathlib import Path

# Start the Node.js server in background
def start_server():
    subprocess.run(["npm", "start"], cwd=str(Path(__file__).parent))

# Start server in a separate thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Keep the app running
if __name__ == "__main__":
    import time
    print("Todo Chatbot is running on Hugging Face Spaces!")
    print("Access the app at the provided URL")
    while True:
        time.sleep(1)

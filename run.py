import subprocess
import time
import webbrowser
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CHATBOT_DIR = os.path.join(BASE_DIR, "Chatbot")
FRONTEND_DIR = os.path.join(CHATBOT_DIR, "frontend")
RASA_DIR = os.path.join(BASE_DIR, "dir")   # 👈 IMPORTANT

print("🧹 Cleaning old processes...")

def kill_port(port):
    try:
        result = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
        for line in result.split("\n"):
            if "LISTENING" in line:
                pid = line.strip().split()[-1]
                subprocess.run(f"taskkill /PID {pid} /F", shell=True)
    except:
        pass

kill_port(5005)
kill_port(8000)
kill_port(5501)

time.sleep(2)

print("🚀 Starting system...")

# -------------------------------
# 🤖 Rasa (CORRECT)
# -------------------------------
print("🤖 Starting Rasa...")

subprocess.Popen(
    [
        os.path.join(RASA_DIR, "rasa_env", "Scripts", "python.exe"),
        "-m",
        "rasa",
        "run",
        "--enable-api",
        "--cors",
        "*"
    ],
    cwd=RASA_DIR
)

time.sleep(10)

# -------------------------------
# ⚙️ FastAPI (CORRECT)
# -------------------------------
print("⚙️ Starting FastAPI...")

subprocess.Popen(
    [
        os.path.join(CHATBOT_DIR, "venv", "Scripts", "python.exe"),
        "-m",
        "uvicorn",
        "backend.main:app",
        "--reload"
    ],
    cwd=CHATBOT_DIR
)

time.sleep(5)

# -------------------------------
# 🌐 Frontend
# -------------------------------
print("🌐 Starting Frontend...")

subprocess.Popen(
    ["python", "-m", "http.server", "5501"],
    cwd=FRONTEND_DIR
)

time.sleep(2)

# -------------------------------
# 🌍 Open UI
# -------------------------------
webbrowser.open("http://localhost:5501")
# -------------------------------
# ⚡ Rasa Actions
# -------------------------------
print("⚡ Starting Rasa Actions...")

subprocess.Popen(
    [
        os.path.join(RASA_DIR, "rasa_env", "Scripts", "python.exe"),
        "-m",
        "rasa",
        "run",
        "actions"
    ],
    cwd=RASA_DIR
)

time.sleep(5)

print("✅ All systems running!")
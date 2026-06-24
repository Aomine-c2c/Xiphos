import os
import sys
import subprocess
import threading
import time
import shutil
import uvicorn
from api_server import app, start_bot_execution, stop_bot_execution

def run_server():
    # Run the FastAPI server with minimal logging so it doesn't corrupt the TUI
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="critical")

def main():
    print("[*] Starting Xiphos Backend API...")
    # Start the Python backend API server in a background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for the server to bind
    time.sleep(1)
    
    # Locate the rust executable.
    base_dir = os.path.dirname(os.path.abspath(__file__))
    rust_project = os.path.join(base_dir, "xiphos-tui")
    rust_exe = os.path.join(rust_project, "target", "release", "xiphos-tui.exe")
    cargo_path = shutil.which("cargo")
    if not cargo_path:
        # Fallback: default Rustup install location on Windows
        default = os.path.join(os.environ.get("USERPROFILE", ""), ".cargo", "bin", "cargo.exe")
        if os.path.exists(default):
            cargo_path = default
    
    try:
        if os.path.exists(rust_exe):
            subprocess.run([rust_exe])
        else:
            if not cargo_path:
                print("[!] Error: 'cargo' not found. Please install Rust from https://rustup.rs/")
                return
            print("[*] First time setup: Compiling the Rust TUI. This may take a moment...")
            print("[*] Note: Building with -j 1 to avoid Windows Defender file locks. This is a one-time setup.")

            # Retry loop: -j 1 forces sequential compilation (one file at a time),
            # which prevents Windows Defender from locking multiple .o files simultaneously.
            max_retries = 5
            for attempt in range(1, max_retries + 1):
                result = subprocess.run(
                    [cargo_path, "build", "--release", "-j", "1"],
                    cwd=rust_project
                )
                if result.returncode == 0:
                    print("[*] Compilation successful! Launching Xiphos TUI...")
                    subprocess.run([rust_exe])
                    break
                elif attempt < max_retries:
                    print(f"[!] Build attempt {attempt} failed (likely file lock). Retrying in 2s...")
                    time.sleep(2)
                else:
                    print("[!] Build failed after all retries. Run 'cargo build --release' manually in xiphos-tui\\ to see the full error.")
    except KeyboardInterrupt:
        pass
    finally:
        stop_bot_execution()
        print("[*] Xiphos shut down successfully.")

if __name__ == "__main__":
    main()

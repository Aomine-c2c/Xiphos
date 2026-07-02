import subprocess
import sys
import time
import os
import atexit
import threading
from collections import deque
from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout

console = Console()

processes = {}
log_queue = deque(maxlen=20)
log_lock = threading.Lock()

def kill_all():
    console.print("\n[bold red]Shutting down all Xiphos components...[/bold red]")
    for name, proc in processes.items():
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
    
    if os.name == 'nt':
        # Aggressively kill Next.js dev server which often orphans node.exe
        subprocess.run(["taskkill", "/F", "/IM", "node.exe"], capture_output=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

atexit.register(kill_all)

def enqueue_output(name, out):
    for line in iter(out.readline, b''):
        decoded = line.decode('utf-8', errors='replace').strip()
        if decoded:
            with log_lock:
                # Color code logs based on source
                color = "white"
                if name == "Redis": color = "red"
                elif name == "API Server": color = "green"
                elif name == "Worker": color = "yellow"
                elif name == "Web UI": color = "cyan"
                log_queue.append(f"[{color}]{name}[/{color}] | {decoded}")
    out.close()

def generate_ui():
    layout = Layout()
    layout.split_column(
        Layout(name="status", ratio=1),
        Layout(name="logs", ratio=3)
    )
    
    # Status Table
    table = Table(show_header=True, header_style="bold magenta", expand=True)
    table.add_column("Component")
    table.add_column("Status")
    table.add_column("Details")
    
    for name, proc in processes.items():
        if proc.poll() is None:
            status = "[bold green]Online[/bold green]"
            if name == "Redis":
                details = "Port 6379"
            elif name == "API Server":
                details = "http://localhost:8001"
            elif name == "Worker":
                details = "Autonomous Trading Active"
            elif name == "Web UI":
                details = "http://localhost:3000"
        else:
            status = f"[bold red]Offline (Code {proc.poll()})[/bold red]"
            details = "Check logs below."
            
        table.add_row(name, status, details)
        
    layout["status"].update(Panel(table, title="[bold cyan]Xiphos Trading System[/bold cyan]", border_style="cyan"))
    
    # Logs Panel
    with log_lock:
        log_text = "\n".join(log_queue)
    layout["logs"].update(Panel(log_text, title="Live Unified Logs", border_style="dim"))
    
    return layout

def spawn_process(name, cmd, cwd, env=None):
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
    )
    processes[name] = proc
    
    t = threading.Thread(target=enqueue_output, args=(name, proc.stdout))
    t.daemon = True
    t.start()

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # We use the python executable that runs this script
    python_exe = sys.executable
    
    redis_exe = os.path.join(root_dir, "tools", "redis", "redis-server.exe")
    if not os.path.exists(redis_exe) and os.name == 'nt':
        # Fallback for linux/wsl
        pass
        
    env = os.environ.copy()
    env["PYTHONPATH"] = root_dir
    
    with log_lock:
        log_queue.append("[bold magenta]SYSTEM[/bold magenta] | Booting orchestrator...")
    
    if os.name == 'nt':
        spawn_process("Redis", [redis_exe], cwd=root_dir)
    else:
        # Assuming redis is installed globally on Linux
        spawn_process("Redis", ["redis-server"], cwd=root_dir)
    time.sleep(1)
    
    spawn_process("API Server", [python_exe, "-m", "uvicorn", "api_server:app", "--port", "8001"], cwd=root_dir, env=env)
    time.sleep(1)
    
    spawn_process("Worker", [python_exe, "worker_engine.py"], cwd=root_dir, env=env)
    time.sleep(1)
    
    web_dir = os.path.join(root_dir, "web")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    spawn_process("Web UI", [npm_cmd, "run", "dev"], cwd=web_dir, env=env)
    
    try:
        with Live(generate_ui(), refresh_per_second=4, console=console) as live:
            while True:
                live.update(generate_ui())
                time.sleep(0.25)
                
                # Auto-exit if all are dead
                if all(p.poll() is not None for p in processes.values()):
                    break
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()

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

        

        subprocess.run(["taskkill", "/F", "/IM", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)



atexit.register(kill_all)



API_SERVER_NAME = "API Server"

WEB_UI_NAME = "Web UI"



def enqueue_output(name, out):

    for line in iter(out.readline, b''):

        decoded = line.decode('utf-8', errors='replace').strip()

        if decoded:

            

            if name == WEB_UI_NAME and ("Compiled in" in decoded or "ready in" in decoded):

                continue

            with log_lock:

                

                color = "white"

                if name == "Redis": color = "red"

                elif name == API_SERVER_NAME: color = "green"

                elif name == "Worker": color = "yellow"

                elif name == WEB_UI_NAME: color = "cyan"

                log_queue.append(f"[{color}]{name}[/{color}] | {decoded}")

    out.close()



import redis

import json



def fetch_api_state():

    try:

        r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True, protocol=2)

        state_json = r.get("xiphos:state")

        if state_json:

            return json.loads(state_json)

        return None

    except Exception as e:

        with log_lock:

            log_queue.append(f"[bold red]fetch_api_state error: {e}[/bold red]")

        return None



def _get_process_details(name, proc, mt5_connected):

    if proc.poll() is not None:

        return f"[bold red]Offline (Code {proc.poll()})[/bold red]", "Check logs below."

        

    status = "[bold green]Online[/bold green]"

    if name == "Redis":

        return status, "Port 6379"

    elif name == API_SERVER_NAME:

        return status, "http://localhost:8001"

    elif name == "Worker":

        details = "[bold green]MT5 Connected & Trading[/bold green]" if mt5_connected else "[bold yellow]Awaiting MT5 Connection...[/bold yellow]"

        return status, details

    elif name == WEB_UI_NAME:

        return status, "http://localhost:3000"

    return status, ""



def generate_ui():

    layout = Layout()

    layout.split_column(

        Layout(name="status", size=10),

        Layout(name="logs")

    )

    

    

    table = Table(show_header=True, header_style="bold magenta", expand=True)

    table.add_column("Component")

    table.add_column("Status")

    table.add_column("Details")

    

    api_state = fetch_api_state()

    mt5_connected = api_state.get("mt5_connected", False) if api_state else False

    

    for name, proc in processes.items():

        status, details = _get_process_details(name, proc, mt5_connected)

        table.add_row(name, status, details)

        

    layout["status"].update(Panel(table, title="[bold cyan]Xiphos Trading System[/bold cyan]", border_style="cyan"))

    

    

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

    

    return proc



def pre_flight_cleanup():

    if os.name == 'nt':

        with log_lock:

            log_queue.append("[bold magenta]SYSTEM[/bold magenta] | Performing pre-flight cleanup of orphaned processes...")

        

        

        subprocess.run(["taskkill", "/F", "/IM", "redis-server.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        subprocess.run(["taskkill", "/F", "/IM", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        

        

        ps_script = (

            "Get-WmiObject Win32_Process | "

            "Where-Object { $_.Name -eq 'python.exe' -and ($_.CommandLine -match 'api_server' -or $_.CommandLine -match 'worker_engine.py') } | "

            "ForEach-Object { $_.Terminate() }"

        )

        subprocess.run(["powershell", "-Command", ps_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        time.sleep(1)



def main():

    root_dir = os.path.dirname(os.path.abspath(__file__))

    

    

    venv_python = os.path.join(root_dir, ".venv", "Scripts", "python.exe") if os.name == 'nt' else os.path.join(root_dir, ".venv", "bin", "python")

    python_exe = venv_python if os.path.exists(venv_python) else sys.executable

    

    redis_exe = os.path.join(root_dir, "tools", "redis", "redis-server.exe")

    if not os.path.exists(redis_exe) and os.name == 'nt':

        

        pass

        

    env = os.environ.copy()

    env["PYTHONPATH"] = root_dir

    env["PYTHONUNBUFFERED"] = "1"

    

    with log_lock:

        log_queue.append("[bold magenta]SYSTEM[/bold magenta] | Booting orchestrator...")

        

    pre_flight_cleanup()

    

    def check_fatal(name, proc):

        if proc.poll() is not None:

            console.print(f"\n[bold red]FATAL ERROR: {name} failed to start (Exit Code {proc.poll()}). Aborting boot sequence.[/bold red]")

            with log_lock:

                for line in log_queue:

                    print(line)

            sys.exit(1) 

    

    if os.name == 'nt':

        proc_redis = spawn_process("Redis", [redis_exe], cwd=root_dir)

    else:

        

        proc_redis = spawn_process("Redis", ["redis-server"], cwd=root_dir)

    time.sleep(1.5)

    check_fatal("Redis", proc_redis)

    

    proc_api = spawn_process(API_SERVER_NAME, [python_exe, "-m", "uvicorn", "api_server:app", "--port", "8001"], cwd=root_dir, env=env)

    time.sleep(2.0)

    check_fatal(API_SERVER_NAME, proc_api)

    

    proc_worker = spawn_process("Worker", [python_exe, "worker_engine.py"], cwd=root_dir, env=env)

    time.sleep(2.0)

    check_fatal("Worker", proc_worker)

    

    web_dir = os.path.join(root_dir, "web")

    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    proc_web = spawn_process(WEB_UI_NAME, [npm_cmd, "run", "dev"], cwd=web_dir, env=env)

    time.sleep(1.0)

    check_fatal(WEB_UI_NAME, proc_web)

    

    try:

        with Live(generate_ui(), refresh_per_second=4, console=console) as live:

            while True:

                live.update(generate_ui())

                time.sleep(0.25)

                

                

                if all(p.poll() is not None for p in processes.values()):

                    break

    except KeyboardInterrupt:

        pass



if __name__ == "__main__":

    main()


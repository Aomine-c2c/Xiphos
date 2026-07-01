@echo off
setlocal
set ROOT=%~dp0
echo.
echo  =========================================
echo   XIPHOS - Starting All Services
echo  =========================================
echo.

:: [0] Redis - use 'start "" ...' to avoid input redirection issues
if exist "%ROOT%tools\redis\redis-server.exe" (
    echo [0/3] Starting Redis Server...
    start "" "%ROOT%tools\redis\redis-server.exe"
    timeout /t 2 /nobreak >nul
    echo       Redis started.
) else (
    echo [!] Redis binary not found. Ensure Redis is running manually on port 6379.
)
echo.

:: [1] FastAPI Backend
echo [1/3] Starting API Server on port 8001...
set PYTHONPATH=%ROOT%
start "Xiphos API" cmd /k "cd /d %ROOT% && .venv\Scripts\python.exe -m uvicorn api_server:app --port 8001 --reload"
timeout /t 2 /nobreak >nul
echo.

:: [2] Worker Engine (MT5 Bridge)
echo [2/3] Starting Worker Engine...
start "Xiphos Engine" cmd /k "cd /d %ROOT% && .venv\Scripts\python.exe worker_engine.py"
timeout /t 2 /nobreak >nul
echo.

:: [3] Next.js UI
echo [3/3] Starting Next.js Web UI on port 3000...
start "Xiphos Web UI" cmd /k "cd /d %ROOT%web && npm run dev"
echo.

echo  =========================================
echo   All services are starting up!
echo   Web UI: http://localhost:3000
echo   API:    http://localhost:8001
echo  =========================================
echo.
pause

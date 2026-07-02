
# Xiphos Local Launcher
# Run this from PowerShell in the Xiphos directory: .\launch.ps1

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = "$Root\.venv\Scripts\python.exe"
$Redis  = "$Root\tools\redis\redis-server.exe"

Write-Host ""
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host "  XIPHOS - Launching All Services" -ForegroundColor Cyan
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host ""

# [0] Redis
if (Test-Path $Redis) {
    Write-Host "[0/3] Starting Redis..." -ForegroundColor Yellow
    Start-Process $Redis -WorkingDirectory $Root
    Start-Sleep -Seconds 2
    Write-Host "      Redis OK" -ForegroundColor Green
} else {
    Write-Host "[!] Redis not found at $Redis" -ForegroundColor Red
}

# [1] FastAPI
Write-Host "[1/3] Starting API Server (port 8001)..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k title Xiphos-API && set PYTHONPATH=$Root && `"$Python`" -m uvicorn api_server:app --port 8001" -WorkingDirectory $Root
Start-Sleep -Seconds 2

# [2] Worker Engine
Write-Host "[2/3] Starting Worker Engine..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k title Xiphos-Engine && set PYTHONPATH=$Root && `"$Python`" worker_engine.py" -WorkingDirectory $Root
Start-Sleep -Seconds 1

# [3] Next.js
Write-Host "[3/3] Starting Web UI (port 3000)..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k title Xiphos-WebUI && npm run dev" -WorkingDirectory "$Root\web"

Write-Host ""
Write-Host " =========================================" -ForegroundColor Green
Write-Host "  All services launched!" -ForegroundColor Green
Write-Host "  Web UI -> http://localhost:3000" -ForegroundColor Green
Write-Host "  API    -> http://localhost:8001" -ForegroundColor Green
Write-Host " =========================================" -ForegroundColor Green
Write-Host ""

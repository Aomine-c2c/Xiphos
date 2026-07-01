# Xiphos Local Launcher
# Run from PowerShell: .\launch.ps1

$Root   = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = "$Root\.venv\Scripts\python.exe"
$Redis  = "$Root\tools\redis\redis-server.exe"
$Web    = "$Root\web"

Write-Host ""
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host "  XIPHOS - Launching All Services" -ForegroundColor Cyan
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host ""

# [0] Redis — launch via Start-Process directly, not via cmd wrapper
if (Test-Path $Redis) {
    Write-Host "[0/3] Starting Redis..." -ForegroundColor Yellow
    Start-Process -FilePath $Redis -WorkingDirectory $Root -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "      Redis OK" -ForegroundColor Green
} else {
    Write-Host "[!] Redis not found at $Redis" -ForegroundColor Red
}

# Write temp launcher scripts so Start-Process has no escaping issues
$apiScript    = "$Root\tools\_run_api.cmd"
$engineScript = "$Root\tools\_run_engine.cmd"
$webScript    = "$Root\tools\_run_web.cmd"

"@echo off`r`ntitle Xiphos-API`r`ncd /d $Root`r`nset PYTHONPATH=$Root`r`n`"$Python`" -m uvicorn api_server:app --port 8001`r`npause" | Set-Content $apiScript -Encoding ASCII
"@echo off`r`ntitle Xiphos-Engine`r`ncd /d $Root`r`nset PYTHONPATH=$Root`r`n`"$Python`" worker_engine.py`r`npause" | Set-Content $engineScript -Encoding ASCII
"@echo off`r`ntitle Xiphos-WebUI`r`ncd /d $Web`r`nnpm run dev`r`npause" | Set-Content $webScript -Encoding ASCII

# [1] API
Write-Host "[1/3] Starting API Server (port 8001)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $apiScript -WindowStyle Normal
Start-Sleep -Seconds 3

# [2] Engine
Write-Host "[2/3] Starting Worker Engine..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $engineScript -WindowStyle Normal
Start-Sleep -Seconds 1

# [3] Web
Write-Host "[3/3] Starting Web UI (port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $webScript -WindowStyle Normal

Write-Host ""
Write-Host " =========================================" -ForegroundColor Green
Write-Host "  All services launched!" -ForegroundColor Green
Write-Host "  Web UI -> http://localhost:3000" -ForegroundColor Green
Write-Host "  API    -> http://localhost:8001" -ForegroundColor Green
Write-Host " =========================================" -ForegroundColor Green
Write-Host ""

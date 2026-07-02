# Xiphos Local Launcher
# Run this from PowerShell in the Xiphos directory: .\launch.ps1

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = "$Root\.venv\Scripts\python.exe"

# If the virtual environment is not set up, try global python
if (!(Test-Path $Python)) {
    $Python = "python"
}

Write-Host ""
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host "  XIPHOS - Unified Execution Engine" -ForegroundColor Cyan
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host ""

try {
    & $Python xiphos.py
} catch {
    Write-Host "Error launching Xiphos. Ensure dependencies are installed." -ForegroundColor Red
}

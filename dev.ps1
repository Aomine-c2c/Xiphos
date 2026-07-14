# Xiphos Unified Development Launcher
# Bypasses execution policies to launch Tauri, Next.js, and Python backend simultaneously.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host "  XIPHOS - Unified Dev Environment" -ForegroundColor Cyan
Write-Host " =========================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the right directory
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

# Install Next.js dependencies if missing
if (!(Test-Path "web\node_modules")) {
    Write-Host "Installing Web dependencies..." -ForegroundColor Yellow
    cmd.exe /c "cd web && npm install"
}

# Install Tauri dependencies if missing
if (!(Test-Path "node_modules")) {
    Write-Host "Installing Tauri dependencies..." -ForegroundColor Yellow
    cmd.exe /c "npm install"
}

# Launch Tauri Development Server (Bypasses PowerShell script execution policy)
Write-Host "Launching Tauri Development Environment..." -ForegroundColor Green
cmd.exe /c "npx @tauri-apps/cli dev"

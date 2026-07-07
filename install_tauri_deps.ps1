# install_tauri_deps.ps1
# ─────────────────────────────────────────────────────────────────────────────
# One-time developer setup script for the Xiphos Windows app.
# Installs Rust, Tauri CLI, and verifies WebView2 is available.
#
# Run from the project root:
#   .\install_tauri_deps.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host "  Xiphos — Windows App Developer Setup" -ForegroundColor Cyan
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check / Install Rust ──────────────────────────────────────────────────
if (-not (Get-Command "rustc" -ErrorAction SilentlyContinue)) {
    Write-Host "[1/4] Rust not found. Installing via rustup..." -ForegroundColor Yellow
    $TmpFile = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $TmpFile -UseBasicParsing
    & $TmpFile -y --default-toolchain stable-x86_64-pc-windows-msvc
    Remove-Item $TmpFile

    # Reload PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Host " -> Rust installed." -ForegroundColor Green
} else {
    $rv = rustc --version
    Write-Host "[1/4] Rust already installed: $rv" -ForegroundColor Green
}

# ── 2. Install / Update Tauri CLI ────────────────────────────────────────────
Write-Host "[2/4] Installing Tauri CLI (cargo install tauri-cli)..." -ForegroundColor Cyan
cargo install tauri-cli --version "^2" --locked 2>&1 | Write-Host
Write-Host " -> Tauri CLI ready." -ForegroundColor Green

# ── 3. Check WebView2 ────────────────────────────────────────────────────────
Write-Host "[3/4] Checking Microsoft WebView2..." -ForegroundColor Cyan
$wv2Key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
if (Test-Path $wv2Key) {
    $version = (Get-ItemProperty $wv2Key).pv
    Write-Host " -> WebView2 found: $version" -ForegroundColor Green
} else {
    Write-Host " -> WebView2 NOT found. Downloading installer..." -ForegroundColor Yellow
    $wv2Setup = "$env:TEMP\MicrosoftEdgeWebview2Setup.exe"
    Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $wv2Setup -UseBasicParsing
    Start-Process -FilePath $wv2Setup -ArgumentList "/silent /install" -Wait
    Remove-Item $wv2Setup
    Write-Host " -> WebView2 installed." -ForegroundColor Green
}

# ── 4. Install Node deps for web/ ────────────────────────────────────────────
Write-Host "[4/4] Installing web/ npm dependencies..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\web"
try {
    cmd /c "npm install" 2>&1 | Write-Host
} finally {
    Pop-Location
}

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Green
Write-Host "  Setup complete! You can now run:" -ForegroundColor Green
Write-Host "    cargo tauri dev    (development with hot-reload)" -ForegroundColor Green
Write-Host "    .\build_app.ps1    (production installer)" -ForegroundColor Green
Write-Host " ============================================================" -ForegroundColor Green
Write-Host ""

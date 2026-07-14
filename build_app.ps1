# build_app.ps1
# -----------------------------------------------------------------------------
# Master build script — produces the final Xiphos Windows installer.
#
# Usage:
#   .\build_app.ps1           # full build
#   .\build_app.ps1 -SkipPython   # skip Python embed (if already bundled)
# -----------------------------------------------------------------------------

param(
    [switch]$SkipPython
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($num, $total, $msg) {
    Write-Host ""
    Write-Host " -- Step $($num)/$($total): $msg" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Magenta
Write-Host "  Xiphos Windows App Builder" -ForegroundColor Magenta
Write-Host " ============================================================" -ForegroundColor Magenta
Write-Host ""

# -- 1. Python embed ----------------------------------------------------------
if (-not $SkipPython) {
    Write-Step 1 4 "Bundling Python runtime..."
    & "$Root\backend\scripts\bundle_python.ps1"
} else {
    Write-Host "[1/4] Skipping Python embed (--SkipPython)" -ForegroundColor Yellow
}

# -- 2. Next.js static build --------------------------------------------------
Write-Step 2 4 "Building Next.js frontend (static export)..."
Push-Location "$Root\web"
try {
    $tempPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    cmd /c "npm run build"
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $tempPref
    if ($exitCode -ne 0) { throw "Next.js build failed (exit $exitCode)" }
    if (-not (Test-Path "$Root\web\out")) {
        throw "Next.js build succeeded but 'out/' directory is missing. Check next.config.ts."
    }
    Write-Host " -> Next.js static export: web/out/" -ForegroundColor Green
} finally {
    Pop-Location
}

# -- 3. Tauri / Rust build ----------------------------------------------------
Write-Step 3 4 "Compiling Tauri application (this may take several minutes)..."
Push-Location "$Root"
try {
    $tempPref = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    cmd /c "npx @tauri-apps/cli build"
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $tempPref
    if ($exitCode -ne 0) { throw "Tauri build failed (exit $exitCode)" }
} finally {
    Pop-Location
}

# -- 4. Report output ---------------------------------------------------------
Write-Step 4 4 "Build complete!"

$InstallerDir = "$Root\src-tauri\target\release\bundle\nsis"
$Installer = Get-ChildItem $InstallerDir -Filter "*-setup.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($Installer) {
    $SizeMB = [math]::Round($Installer.Length / 1MB, 1)
    Write-Host " ============================================================" -ForegroundColor Green
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "  Installer: $($Installer.FullName)" -ForegroundColor Green
    Write-Host "  Size: ${SizeMB} MB" -ForegroundColor Green
    Write-Host " ============================================================" -ForegroundColor Green
} else {
    Write-Host " Installer not found at expected path: $InstallerDir" -ForegroundColor Yellow
    Write-Host " Check src-tauri/target/release/bundle/ for output." -ForegroundColor Yellow
}

Write-Host ""

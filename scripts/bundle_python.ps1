# bundle_python.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Downloads the Python 3.12 embedded distribution for Windows x64 and installs
# all project dependencies into it, producing the python-embed/ directory that
# Tauri will bundle into the installer.
#
# Run once before `cargo tauri build`:
#   .\scripts\bundle_python.ps1
# ─────────────────────────────────────────────────────────────────────────────

param(
    [string]$PythonVersion = "3.12.10",
    [string]$OutDir = "$PSScriptRoot\..\python-embed"
)

$ErrorActionPreference = "Stop"

$EmbedUrl = "https://www.python.org/ftp/python/$PythonVersion/python-$PythonVersion-embed-amd64.zip"
$GetPipUrl = "https://bootstrap.pypa.io/get-pip.py"
$ZipPath = "$env:TEMP\python-embed.zip"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host "  Xiphos — Python Embed Bundler" -ForegroundColor Cyan
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Download Python Embedded ────────────────────────────────────────
if (Test-Path $OutDir) {
    Write-Host "[1/5] Removing existing python-embed/ ..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $OutDir
}

Write-Host "[1/5] Downloading Python $PythonVersion embedded distribution..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $EmbedUrl -OutFile $ZipPath -UseBasicParsing

Write-Host "[2/5] Extracting to $OutDir ..." -ForegroundColor Cyan
Expand-Archive -Path $ZipPath -DestinationPath $OutDir -Force
Remove-Item $ZipPath

# ── Step 2: Enable site-packages (edit ._pth file) ──────────────────────────
Write-Host "[3/5] Enabling site-packages..." -ForegroundColor Cyan
$PthFile = Get-ChildItem $OutDir -Filter "python3*._pth" | Select-Object -First 1
if ($PthFile) {
    $content = Get-Content $PthFile.FullName -Raw
    # Uncomment `import site` line
    $content = $content -replace "#import site", "import site"
    # Add the project root to the path so Python can find xiphos packages
    $content += "`n$ProjectRoot`n"
    Set-Content -Path $PthFile.FullName -Value $content
}

# ── Step 3: Install pip ──────────────────────────────────────────────────────
Write-Host "[4/5] Installing pip..." -ForegroundColor Cyan
$GetPipPath = "$env:TEMP\get-pip.py"
Invoke-WebRequest -Uri $GetPipUrl -OutFile $GetPipPath -UseBasicParsing
& "$OutDir\python.exe" $GetPipPath --no-warn-script-location
Remove-Item $GetPipPath

# ── Step 4: Install project dependencies ────────────────────────────────────
Write-Host "[5/5] Installing project dependencies from pyproject.toml..." -ForegroundColor Cyan

$PipExe = "$OutDir\Scripts\pip.exe"
if (-not (Test-Path $PipExe)) {
    # Some embed distributions put pip in the root
    $PipExe = "$OutDir\pip.exe"
}

# Install all deps defined in pyproject.toml
& $PipExe install --target "$OutDir\Lib\site-packages" `
    --no-warn-script-location `
    -e "$ProjectRoot" 2>&1 | Write-Host

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Green
Write-Host "  python-embed/ is ready for bundling!" -ForegroundColor Green
Write-Host "  Size: $([math]::Round((Get-ChildItem $OutDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 1)) MB" -ForegroundColor Green
Write-Host " ============================================================" -ForegroundColor Green
Write-Host ""

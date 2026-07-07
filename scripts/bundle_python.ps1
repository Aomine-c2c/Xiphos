param(
    [string]$PythonVersion = "3.12.10",
    [string]$OutDir = "$PSScriptRoot\..\python-embed"
)

$ErrorActionPreference = "Stop"

$EmbedUrl = "https://www.python.org/ftp/python/$PythonVersion/python-$PythonVersion-embed-amd64.zip"
$GetPipUrl = "https://bootstrap.pypa.io/get-pip.py"
$ZipPath = "$env:TEMP\python-embed.zip"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

if (Test-Path $OutDir) {
    Remove-Item -Recurse -Force $OutDir
}

Invoke-WebRequest -Uri $EmbedUrl -OutFile $ZipPath -UseBasicParsing
Expand-Archive -Path $ZipPath -DestinationPath $OutDir -Force
Remove-Item $ZipPath

$PthFile = Get-ChildItem $OutDir -Filter "python3*._pth" | Select-Object -First 1
if ($PthFile) {
    $content = Get-Content $PthFile.FullName -Raw
    $content = $content -replace "#import site", "import site"
    $content += "`n$ProjectRoot`n"
    Set-Content -Path $PthFile.FullName -Value $content
}

$GetPipPath = "$env:TEMP\get-pip.py"
Invoke-WebRequest -Uri $GetPipUrl -OutFile $GetPipPath -UseBasicParsing
& "$OutDir\python.exe" $GetPipPath --no-warn-script-location
Remove-Item $GetPipPath

$PipExe = "$OutDir\Scripts\pip.exe"
if (-not (Test-Path $PipExe)) {
    $PipExe = "$OutDir\pip.exe"
}

& $PipExe install setuptools wheel --no-warn-script-location
& $PipExe install --target "$OutDir\Lib\site-packages" --no-warn-script-location -e "$ProjectRoot"

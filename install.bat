@echo off
setlocal

echo ==========================================
echo     Xiphos Windows Setup Script
echo ==========================================

:: 1. Check for Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [*] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from python.org
    exit /b 1
)

:: 2. Check for Git
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [*] Git is not installed!
    echo Please install Git from git-scm.com
    exit /b 1
)

:: 3. Clone Repository
echo [*] Checking for Xiphos repository...
if not exist "main.py" (
    if not exist "Xiphos" (
        echo [*] Cloning repository...
        git clone https://github.com/Aomine-c2c/Xiphos.git
        cd Xiphos
    ) else (
        cd Xiphos
    )
)

:: 4. Setup Python Environment
echo [*] Setting up Python Virtual Environment...
python -m venv venv
call venv\Scripts\activate.bat

echo [*] Upgrading pip...
python -m pip install --upgrade pip

echo [*] Installing Python dependencies...
pip install -r requirements.txt

:: 5. Create Configuration
echo [*] Creating configuration...
if not exist "config" mkdir config
if not exist "config\settings.yaml" (
    echo execution: > config\settings.yaml
    echo   mode: "DIRECT" >> config\settings.yaml
    echo   bridge_url: "http://127.0.0.1:8000" >> config\settings.yaml
    echo. >> config\settings.yaml
    echo trading: >> config\settings.yaml
    echo   max_risk_trades: 4 >> config\settings.yaml
    echo   timeframe: "M30" >> config\settings.yaml
    echo. >> config\settings.yaml
    echo magic_numbers: >> config\settings.yaml
    echo   scalper: 135001 >> config\settings.yaml
    echo   runner: 135002 >> config\settings.yaml
    echo. >> config\settings.yaml
    echo correlation_groups: >> config\settings.yaml
    echo   group_1_majors: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY"] >> config\settings.yaml
    echo   group_2_metals: ["XAUUSD", "XAGUSD"] >> config\settings.yaml
    echo   group_3_exotics: ["EURJPY", "GBPJPY", "USDCAD", "USDCHF"] >> config\settings.yaml
    echo   group_4_crypto: ["BTCUSD"] >> config\settings.yaml
    echo   group_5_indices: ["Volatility 75 Index"] >> config\settings.yaml
)

echo ==========================================
echo          INSTALLATION COMPLETE!          
echo ==========================================
echo.
echo To run Xiphos on Windows:
echo 1. venv\Scripts\activate
echo 2. python tui.py
echo ==========================================
pause

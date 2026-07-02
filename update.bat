@echo off
echo ==========================================
echo           UPDATING XIPHOS
echo ==========================================

echo [*] Checking for updates...
git fetch

for /f "delims=" %%i in ('git rev-parse HEAD') do set LOCAL=%%i
for /f "delims=" %%i in ('git rev-parse origin/main') do set REMOTE=%%i

if "%LOCAL%"=="%REMOTE%" (
    echo [*] Xiphos is already up to date!
    exit /b 0
)

echo [*] Pulling latest changes from git...
git pull

echo [*] Updating Python dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -e .

echo [*] Updating Web Dashboard...
cd web
call npm install
call npm run build
cd ..

echo ==========================================
echo           UPDATE COMPLETE!
echo ==========================================
pause

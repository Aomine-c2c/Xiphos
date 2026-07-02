@echo off
echo ==========================================
echo           UPDATING XIPHOS
echo ==========================================

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

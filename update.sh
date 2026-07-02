#!/bin/bash
echo "=========================================="
echo "          UPDATING XIPHOS                 "
echo "=========================================="

echo "[*] Pulling latest changes from git..."
git pull

echo "[*] Updating Python dependencies..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
fi

pip install --upgrade pip
pip install -e .

echo "[*] Updating Web Dashboard..."
cd web
npm install
npm run build
cd ..

echo "=========================================="
echo "          UPDATE COMPLETE!                "
echo "=========================================="

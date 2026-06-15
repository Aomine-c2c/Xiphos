#!/bin/bash
# Xiphos Termux Installation Script
# This script sets up Termux to run the Xiphos Bot in BRIDGE mode.

echo "=========================================="
echo "    Xiphos Termux Setup (Bridge Mode)     "
echo "=========================================="

echo "[*] Updating Termux packages..."
pkg update -y && pkg upgrade -y

echo "[*] Installing required dependencies (Python, Git, Build Tools)..."
pkg install python git nano build-essential libffi-dev openssl-dev -y

echo "[*] Cloning Xiphos repository..."
if [ ! -d "Xiphos" ]; then
    git clone https://github.com/Aomine-c2c/Xiphos.git
fi
cd Xiphos

echo "[*] Removing Windows-only MetaTrader5 package from requirements..."
sed -i.bak '/MetaTrader5/d' requirements.txt

echo "[*] Setting up Python Virtual Environment..."
python -m venv venv
source venv/bin/activate

echo "[*] Upgrading pip..."
pip install --upgrade pip

echo "[*] Installing Python dependencies..."
pip install -r requirements.txt

echo "[*] Creating configuration..."
mkdir -p config
if [ ! -f "config/settings.yaml" ]; then
    cat > config/settings.yaml << EOL
execution:
  mode: "BRIDGE"
  bridge_url: "http://127.0.0.1:8000"

trading:
  max_risk_trades: 4
  timeframe: "M30"

magic_numbers:
  scalper: 135001
  runner: 135002

correlation_groups:
  group_1_majors: ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY"]
  group_2_metals: ["XAUUSD", "XAGUSD"]
  group_3_exotics: ["EURJPY", "GBPJPY", "USDCAD", "USDCHF"]
  group_4_crypto: ["BTCUSD"]
  group_5_indices: ["Volatility 75 Index"]
EOL
fi

echo "=========================================="
echo "          INSTALLATION COMPLETE!          "
echo "=========================================="
echo ""
echo "To run Xiphos in Termux, execute the following commands:"
echo "1. cd Xiphos"
echo "2. source venv/bin/activate"
echo "3. python tui.py"
echo ""
echo "Ensure your Bridge Server is running on Winlator/Windows at 127.0.0.1:8000!"
echo "=========================================="

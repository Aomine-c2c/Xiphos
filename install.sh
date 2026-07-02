#!/bin/bash
# Xiphos Universal Installation Script
# Supports: Termux (Android), Ubuntu/Debian, macOS, Fedora, Arch Linux.

echo "=========================================="
echo "    Xiphos Universal Setup Script         "
echo "=========================================="

OS_TYPE="UNKNOWN"
IS_WINDOWS=false

if [[ "$OSTYPE" == "linux-android"* ]] || [ -n "$TERMUX_VERSION" ]; then
    OS_TYPE="TERMUX"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="MACOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        OS_TYPE="DEBIAN"
    elif [ -f /etc/redhat-release ]; then
        OS_TYPE="FEDORA"
    elif [ -f /etc/arch-release ]; then
        OS_TYPE="ARCH"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    IS_WINDOWS=true
    OS_TYPE="WINDOWS"
fi

echo "[*] Detected OS: $OS_TYPE"

# 1. Install System Dependencies
echo "[*] Installing required system packages..."
if [ "$OS_TYPE" == "TERMUX" ]; then
    pkg update -y && pkg install python git nano build-essential libffi-dev openssl-dev -y
elif [ "$OS_TYPE" == "DEBIAN" ]; then
    sudo apt-get update -y && sudo apt-get install python3 python3-pip python3-venv git build-essential -y
elif [ "$OS_TYPE" == "MACOS" ]; then
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        exit 1
    fi
    brew install python git
elif [ "$OS_TYPE" == "FEDORA" ]; then
    sudo dnf install python3 python3-pip git gcc -y
elif [ "$OS_TYPE" == "ARCH" ]; then
    sudo pacman -Sy python python-pip git base-devel --noconfirm
fi

# 2. Clone Repository
echo "[*] Checking for Xiphos repository..."
if [ ! -d "Xiphos" ] && [ ! -f "main.py" ]; then
    echo "[*] Cloning repository..."
    git clone https://github.com/Aomine-c2c/Xiphos.git
    cd Xiphos
elif [ -d "Xiphos" ]; then
    cd Xiphos
fi

# 3. Setup Python Environment
echo "[*] Setting up Python Virtual Environment..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

$PYTHON_CMD -m venv venv
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
fi

echo "[*] Upgrading pip..."
pip install --upgrade pip

# 4. Install Python dependencies
echo "[*] Installing Python dependencies..."
pip install -e .

# 5. Create Configuration
echo "[*] Creating configuration..."
mkdir -p config
if [ ! -f "config/settings.yaml" ]; then
    if [ "$IS_WINDOWS" = true ]; then
        EXEC_MODE="DIRECT"
        URL="http://127.0.0.1:8000"
    else
        EXEC_MODE="BRIDGE"
        URL="http://127.0.0.1:8000"
    fi
    
    cat > config/settings.yaml << EOL
execution:
  mode: "$EXEC_MODE"
  bridge_url: "$URL"

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

# 6. Select UI & Create Launch Command
echo "[*] Select your preferred User Interface:"
echo "1) Institutional Web Dashboard (Next.js - Recommended)"
echo "2) Terminal UI (TUI - Lightweight)"
read -p "Enter 1 or 2 (Default: 1): " UI_CHOICE
if [ -z "$UI_CHOICE" ]; then
    UI_CHOICE=1
fi

if [ "$UI_CHOICE" == "1" ]; then
    echo "[*] Setting up Web Dashboard dependencies..."
    cd web
    npm install
    npm run build
    cd ..
fi

echo "[*] Setting up 'Xiphos' launch command..."
cat > xiphos_launcher.sh << EOL
#!/bin/bash
cd "$(pwd)"

if [ "$UI_CHOICE" == "1" ]; then
    cd web && npm run start &
    NEXT_PID=\$!
    cd ..
    source venv/bin/activate
    python api_server.py
    kill \$NEXT_PID
else
    source venv/bin/activate
    python tui.py
fi
EOL

chmod +x xiphos_launcher.sh

if [ "$OS_TYPE" == "TERMUX" ]; then
    cp xiphos_launcher.sh $PREFIX/bin/xiphos
    cp xiphos_launcher.sh $PREFIX/bin/Xiphos
elif [ "$OS_TYPE" == "MACOS" ] || [ "$OS_TYPE" == "DEBIAN" ] || [ "$OS_TYPE" == "FEDORA" ] || [ "$OS_TYPE" == "ARCH" ]; then
    mkdir -p ~/.local/bin
    cp xiphos_launcher.sh ~/.local/bin/xiphos
    cp xiphos_launcher.sh ~/.local/bin/Xiphos
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
    fi
fi
rm xiphos_launcher.sh

echo "=========================================="
echo "          INSTALLATION COMPLETE!          "
echo "=========================================="
echo ""
echo "You can now launch the dashboard from anywhere by typing:"
echo "Xiphos"
echo "=========================================="

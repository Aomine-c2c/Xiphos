# Xiphos Trading Framework

Xiphos is a fully autonomous trend-following trading system designed to connect directly to MetaTrader 5. It uses a robust, modular Python architecture to execute M30 structural breakouts while strictly enforcing risk boundaries across multiple assets concurrently.

## Architecture Highlights
- **Configuration-Driven:** Edit `config/settings.yaml` to change symbols or lot sizes instantly without touching code.
- **Safety First:** Hard rules prevent naked trades, averaging down, or hedging.
- **SQLite Audit Trail:** Every trade, signal, and trailing stop is securely logged to `storage/xiphos.sqlite`.
- **Live CLI Dashboard:** Powered by `Rich`, the terminal constantly updates with your live account equity, risk slots, and connection health.

## Installation
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Open MetaTrader 5 and ensure you are logged into your account.
3. Start the bot:
   ```bash
   run.bat
   ```
   *(Or `python main.py` if running from a standard terminal).*

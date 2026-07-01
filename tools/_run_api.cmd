@echo off
title Xiphos-API
cd /d C:\Users\armut\404\Xiphos
set PYTHONPATH=C:\Users\armut\404\Xiphos
"C:\Users\armut\404\Xiphos\.venv\Scripts\python.exe" -m uvicorn api_server:app --port 8001
pause

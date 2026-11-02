@echo off
title JonHunter AI Executive Platform
cd /d "%~dp0"

echo ==========================================================
echo    Starting JonHunter AI Job Platform
echo ==========================================================

echo [1/2] Starting DRC Job Engine & Excel Service (Port 5055)...
start "DRC Job Engine" cmd /c "cd job_engine && python api_server.py"

echo [2/2] Starting DRC React Frontend (Port 5173)...
start http://localhost:5173/
npm run dev
pause

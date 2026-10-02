@echo off
title DRC Job Discovery & Excel Engine (Port 5055)
cd /d "%~dp0"
echo ======================================================================
echo    Starting DRC Job Discovery & Excel Exporter Engine (Port 5055)...
echo ======================================================================
python api_server.py
pause

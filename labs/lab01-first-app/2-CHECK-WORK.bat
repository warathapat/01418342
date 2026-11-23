@echo off
cd /d "%~dp0"
chcp 65001 >nul
node scripts\check-app.mjs %1
echo.
pause

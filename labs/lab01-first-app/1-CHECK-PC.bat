@echo off
cd /d "%~dp0"
chcp 65001 >nul
node scripts\check-env.mjs
echo.
pause

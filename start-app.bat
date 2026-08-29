@echo off
title PDF Exam Generator Launcher
echo Starting PDF Exam Generator...
cd /d "%~dp0"

:: Start the Next.js server in the background
start /min cmd /c "npm run dev"

:: Wait 3 seconds for the server to start, then open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo App launched at http://localhost:3000!
exit

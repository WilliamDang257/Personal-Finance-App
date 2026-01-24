@echo off
echo Starting FinanceFlow...
cd /d "%~dp0"

:: Open the browser immediately (it might take a second for the server to be ready, but Vite is fast)
start http://localhost:5173

:: Start the server
npm run dev
pause

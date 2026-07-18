@echo off
echo ==========================================
echo Starting Blog Engine / Headless CMS
echo ==========================================

REM Check if .env exists, if not copy from ex/.env.example
if not exist .env (
    echo [INFO] .env not found. Creating .env from ex/.env.example...
    copy ex\.env.example .env
)

echo [INFO] Starting Backend Server (Go/Fiber) in a new window...
start "Backend (Go/Fiber)" cmd /k "cd backend && run_air.bat"

echo [INFO] Starting Frontend Client (React/Vite) in a new window...
start "Frontend (React/Vite)" cmd /k "cd web && pnpm dev"

echo ==========================================
echo Both servers are spinning up!
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:5173
echo ==========================================
pause

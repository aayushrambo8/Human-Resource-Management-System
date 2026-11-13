@echo off
echo ========================================================
echo   Starting Northstar HRMS (Backend + Frontend)
echo ========================================================
echo.
echo [1/2] Starting Spring Boot Backend on http://localhost:8080 ...
start "HRMS Backend (Port 8080)" cmd /k "cd backend && mvn spring-boot:run"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
cd frontend && npm run dev


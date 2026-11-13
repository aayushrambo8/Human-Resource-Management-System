Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Northstar HRMS (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; mvn spring-boot:run"

Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm run dev


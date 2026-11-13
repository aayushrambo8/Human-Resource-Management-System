@echo off
setlocal
cd /d "%~dp0"

echo =================================================================
echo   HRMS Native PostgreSQL Check, Auto-Install ^& Schema Launcher
echo =================================================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-database.ps1" %*

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL setup encountered an issue. See output above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [DONE] Database setup completed successfully.
endlocal


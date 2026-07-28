@echo off
where air >nul 2>nul
if %errorlevel% equ 0 goto RUN_AIR

echo [INFO] Air is not installed or not in PATH.
echo [INFO] Installing Air via 'go install github.com/air-verse/air@latest'...
go install github.com/air-verse/air@latest

:: Get GOPATH and append its bin directory to PATH
for /f "tokens=*" %%i in ('go env GOPATH') do set GOPATH=%%i
set PATH=%PATH%;%GOPATH%\bin

where air >nul 2>nul
if %errorlevel% equ 0 goto RUN_AIR

echo [ERROR] Air could not be installed or added to PATH.
echo [ERROR] Please install it manually: go install github.com/air-verse/air@latest
pause
exit /b 1

:RUN_AIR
echo [INFO] Starting application with Air hot reload...
air -c .air.toml

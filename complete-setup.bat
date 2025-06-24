@echo off
cls
echo.
echo ========================================
echo  Real Estate Project - Complete Setup
echo ========================================
echo.

echo 1. Cleaning up any cached files...
cd /d "%~dp0frontend"
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist build rmdir /s /q build

echo.
echo 2. Creating admin user...
cd /d "%~dp0backend"
node seed-admin.js

echo.
echo 3. Testing backend API endpoints...
node test-login-endpoints.js

echo.
echo 4. Starting backend server (in new window)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo 5. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 6. Starting frontend server (in new window)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin Login: http://localhost:3000/admin/login
echo.
echo Credentials:
echo Email: khan@gmail.com
echo Password: admin123
echo.
echo ========================================
echo.
pause

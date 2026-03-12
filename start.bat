@echo off
echo ================================
echo   TIBBI HASTALIK VERITABANI
echo   Sistem Baslatiyor...
echo ================================
echo.

echo [1/3] Backend baslatiyor...
start "Backend Server" cmd /k "cd /d %~dp0backend && echo Backend Server Aktif && py main.py"

echo [2/3] Backend hazir, 3 saniye bekleniyor...
timeout /t 3 /nobreak >nul

echo [3/3] Frontend baslatiyor...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && echo Frontend Server Aktif && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo Tarayici aciliyor...
start http://localhost:5173

echo.
echo ================================
echo   SISTEM HAZIR!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo ================================
echo.
echo Kapatmak icin her iki terminal penceresini kapatin.
pause
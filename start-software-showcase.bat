@echo off
setlocal
cd /d "%~dp0"

set "PORT=3101"
set "SITE_URL=http://localhost:%PORT%/"

if not exist node_modules (
  echo Dependencies are missing. Run npm install in this folder first.
  pause
  exit /b 1
)

rem Keep this project separate from the unrelated service currently using port 3000.
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if errorlevel 1 goto start_server

rem Reuse the port only when its response is this software showcase.
node -e "fetch('%SITE_URL%').then(r=>r.text()).then(t=>process.exit((t.includes('software-layout-frame') || t.includes('littleworks'))?0:1)).catch(()=>process.exit(1))" >nul 2>&1
if errorlevel 1 goto port_conflict
goto wait_for_site

:start_server
start "Software Showcase Dev Server" cmd /k "npm run dev -- -p %PORT%"

:wait_for_site
set /a attempts=0
:check_site
node -e "fetch('%SITE_URL%').then(r=>r.text()).then(t=>process.exit((t.includes('software-layout-frame') || t.includes('littleworks'))?0:1)).catch(()=>process.exit(1))" >nul 2>&1
if not errorlevel 1 goto open_site
set /a attempts+=1
if %attempts% GEQ 60 goto timeout
timeout /t 1 /nobreak >nul
goto check_site

:open_site
start "" "%SITE_URL%"
echo Software showcase is running at %SITE_URL%
echo Admin panel: %SITE_URL%admin
goto end

:port_conflict
echo Port %PORT% is occupied by a different service. Stop it or choose another port.
pause
goto end

:timeout
echo The software showcase did not become ready within 60 seconds. Check the server window.
pause

:end
endlocal


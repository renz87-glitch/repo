@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Build Next.js frontend and publish .NET service for IIS
REM Usage:
REM   scripts\build_and_publish.bat [frontend_env] [publish_dir]
REM     frontend_env: production (default) | intranet
REM     publish_dir : output folder for dotnet publish (default: .\artifacts\publish)

if /I "%~1"=="/h"  goto :help
if /I "%~1"=="-h"  goto :help
if /I "%~1"=="--help" goto :help

set "FRONTEND_ENV=%~1"
if "%FRONTEND_ENV%"=="" set "FRONTEND_ENV=production"

set "PUBLISH_DIR=%~2"
if "%PUBLISH_DIR%"=="" set "PUBLISH_DIR=%CD%\..\artifacts\publish"

set "SERVICE_DIR=%CD%\.."
set "FRONTEND_DIR=%CD%\..\react-app-repo"

echo == Checking prerequisites ==
where dotnet >nul 2>&1 || (echo [ERROR] dotnet CLI not found.& exit /b 1)
where node   >nul 2>&1 || (echo [ERROR] Node.js not found.& exit /b 1)
where npm    >nul 2>&1 || (echo [ERROR] npm not found.& exit /b 1)

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERROR] Frontend folder not found: "%FRONTEND_DIR%" or missing package.json
  echo        Make sure you run this from the repo root.
  exit /b 1
)

echo.
echo == Building React app (Next.js) ==
pushd "%FRONTEND_DIR%" || (echo [ERROR] Cannot enter "%FRONTEND_DIR%" & exit /b 1)
if exist package-lock.json (
  echo npm ci
  call npm ci
) else (
  echo npm install
  call npm install
)
if errorlevel 1 goto :frontend_fail

if /I "%FRONTEND_ENV%"=="intranet" (
  echo npm run build-intranet
  call npm run build-intranet
) else (
  echo npm run build
  call npm run build
)
if errorlevel 1 goto :frontend_fail
popd
echo Frontend build completed.

echo.
echo == Publishing .NET service for IIS ==
if not exist "%PUBLISH_DIR%" (
  mkdir "%PUBLISH_DIR%" || (echo [ERROR] Cannot create publish dir "%PUBLISH_DIR%" & exit /b 1)
)
pushd "%SERVICE_DIR%" || (echo [ERROR] Cannot enter "%SERVICE_DIR%" & exit /b 1)
call dotnet restore
if errorlevel 1 goto :dotnet_fail
call dotnet publish -c Release -o "%PUBLISH_DIR%"
if errorlevel 1 goto :dotnet_fail

REM Ensure a web.config exists for IIS hosting (creates a minimal one if missing)
if not exist "%PUBLISH_DIR%\web.config" (
  echo Creating minimal web.config for IIS...
  > "%PUBLISH_DIR%\web.config" (
    echo ^<configuration^>
    echo   ^<system.webServer^>
    echo     ^<handlers^>
    echo       ^<add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" /^>
    echo     ^</handlers^>
    echo     ^<aspNetCore processPath="dotnet" arguments="ApiRepo.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="inprocess" /^>
    echo   ^</system.webServer^>
    echo ^</configuration^>
  )
)

echo.
echo == Done ==
echo Publish output: "%PUBLISH_DIR%"
echo Deploy by creating an IIS site/app pointing to this folder. Ensure the ^"ASP.NET Core Hosting Bundle^" is installed.
exit /b 0

:help
echo Usage: scripts\build_and_publish.bat [frontend_env] [publish_dir]
echo   frontend_env: production ^(default^) ^| intranet
echo   publish_dir : output folder for dotnet publish ^(default: .\artifacts\publish^)
exit /b 0

:frontend_fail
echo [ERROR] Frontend build failed.
popd 2^>nul
exit /b 1

:dotnet_fail
echo [ERROR] .NET publish failed.
exit /b 1

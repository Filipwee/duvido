@echo off
REM team-metrics.bat — gera relatório de saúde do time de agentes
REM Uso: .claude\state\metrics\team-metrics.bat [dias]
REM Exemplo: .claude\state\metrics\team-metrics.bat 30

setlocal enabledelayedexpansion

set "DAYS=%~1"
if "%DAYS%"=="" set "DAYS=7"

set "PROJECT_DIR=%~dp0..\..\..\"
set "CHANGE_LOG=%PROJECT_DIR%.claude\state\change-log.md"
set "BASH_LOG=%PROJECT_DIR%.claude\state\bash-log.md"
set "HANDOFF_LOG=%PROJECT_DIR%.claude\state\handoff-log.md"

echo ================================================
echo  Team Metrics — Ultimos %DAYS% dias
echo  Multi-Stack Orchestrator
echo ================================================
echo Data: %DATE% %TIME%
echo.

REM Arquivos modificados
echo --- Arquivos modificados ---
if exist "%CHANGE_LOG%" (
    find /c /v "" "%CHANGE_LOG%" 2>nul
    echo linhas no change-log
) else (
    echo Nenhum change-log encontrado
)
echo.

REM Comandos Maven mais usados
echo --- Comandos Maven executados ---
if exist "%BASH_LOG%" (
    findstr /i "mvn" "%BASH_LOG%"
) else (
    echo Nenhum bash-log encontrado
)
echo.

REM Handoffs de agentes
echo --- Handoffs de agentes ---
if exist "%HANDOFF_LOG%" (
    type "%HANDOFF_LOG%"
) else (
    echo Nenhum handoff registrado
)
echo.

echo ================================================
echo  Fim do relatorio
echo ================================================

endlocal
exit /b 0

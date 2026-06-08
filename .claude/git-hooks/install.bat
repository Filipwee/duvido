@echo off
REM install.bat — instala git hooks no repositório atual
REM Execute na raiz do projeto: .claude\git-hooks\install.bat

setlocal

set "HOOKS_SRC=%~dp0"
set "HOOKS_DST=.git\hooks"

echo ================================================
echo  Instalando Git Hooks — Multi-Stack Orchestrator
echo ================================================

REM Verifica se está em um repositório git
if not exist ".git" (
    echo ERRO: Execute na raiz do repositorio git
    echo Diretorio atual: %CD%
    exit /b 1
)

REM Cria diretório hooks se não existir
if not exist "%HOOKS_DST%" mkdir "%HOOKS_DST%"

REM Instala pre-commit
if exist "%HOOKS_SRC%pre-commit" (
    copy /y "%HOOKS_SRC%pre-commit" "%HOOKS_DST%\pre-commit" >nul
    echo [OK] pre-commit instalado
) else (
    echo [SKIP] pre-commit nao encontrado
)

REM Instala commit-msg
if exist "%HOOKS_SRC%commit-msg" (
    copy /y "%HOOKS_SRC%commit-msg" "%HOOKS_DST%\commit-msg" >nul
    echo [OK] commit-msg instalado
) else (
    echo [SKIP] commit-msg nao encontrado
)

REM Instala pre-push (se existir)
if exist "%HOOKS_SRC%pre-push" (
    copy /y "%HOOKS_SRC%pre-push" "%HOOKS_DST%\pre-push" >nul
    echo [OK] pre-push instalado
)

REM Configura git para usar LF no Windows
git config core.autocrlf false
git config core.eol lf
git config core.encoding utf-8
echo [OK] Git configurado para LF + UTF-8

echo ================================================
echo  Hooks instalados com sucesso!
echo  Teste com: git commit --allow-empty -m "test"
echo ================================================

endlocal
exit /b 0

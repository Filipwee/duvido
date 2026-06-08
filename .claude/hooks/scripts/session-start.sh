#!/bin/bash
# session-start.sh — executado no início de cada sessão do Claude Code
# Compatível com Git Bash / WSL no Windows
# Detecta stacks ativos do project-profile.md e verifica suas toolchains.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
DASHBOARD="$PROJECT_DIR/.claude/state/dashboard.md"
PLAN="$PROJECT_DIR/.claude/state/current-plan.md"
PROFILE="$PROJECT_DIR/.claude/project-profile.md"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Multi-Stack Orchestrator — Sessão iniciada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Projeto: $(basename "$PROJECT_DIR")"
echo "Data: $(date '+%Y-%m-%d %H:%M')"

# Extrai stacks ativos do project-profile.md (formato YAML simples)
if [ -f "$PROFILE" ]; then
    ACTIVE=$(awk '
        /^active_stacks:/ {flag=1; next}
        flag && /^[a-zA-Z]/ {flag=0}
        flag && /- / {gsub(/^[[:space:]]*-[[:space:]]*/, ""); gsub(/[[:space:]]*$/, ""); print}
    ' "$PROFILE")
    if [ -n "$ACTIVE" ]; then
        echo "Stacks ativos:"
        echo "$ACTIVE" | sed 's/^/  • /'
    else
        echo "Stacks ativos: nenhum (modo auto-detect ou profile vazio)"
    fi
else
    echo "⚠️  project-profile.md não encontrado — Viktor vai propor stack na sessão"
fi

# Verifica toolchains COMUNS (não bloqueia se faltar — só informa)
echo ""
echo "Toolchains detectadas:"
for tool in java mvn gradle node npm pnpm yarn python python3 pip poetry uv pytest go cargo dotnet ruby make; do
    if command -v $tool &>/dev/null; then
        VERSION=$($tool --version 2>&1 | head -1 | tr -d '\r')
        printf "  %-10s %s\n" "$tool:" "$VERSION"
    fi
done

# Verifica git
echo ""
if command -v git &>/dev/null; then
    BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "sem branch")
    echo "Git branch: $BRANCH"
fi

# Status do dashboard
if [ -f "$DASHBOARD" ]; then
    STATUS_LINE=$(grep "^## Status geral" -A1 "$DASHBOARD" | tail -1)
    echo "Status: $STATUS_LINE"
fi

# Plan ativo
if [ -f "$PLAN" ]; then
    PLAN_STATUS=$(grep "^Status:" "$PLAN" | head -1)
    echo "Plano: $PLAN_STATUS"
fi

# Plugins disponíveis
echo ""
PLUGINS_DIR="$PROJECT_DIR/.claude/plugins"
if [ -d "$PLUGINS_DIR" ]; then
    echo "Plugins instalados:"
    for plug in "$PLUGINS_DIR"/*/; do
        if [ -d "$plug" ] && [ "$(basename "$plug")" != "" ]; then
            PLUG_NAME=$(basename "$plug")
            # Pular pastas que não são plugins (docs, README)
            if [ "$PLUG_NAME" = "understand-anything-docs" ]; then continue; fi
            VERSION=""
            if [ -f "$plug/.claude-plugin/plugin.json" ]; then
                VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$plug/.claude-plugin/plugin.json" 2>/dev/null | head -1 | sed 's/.*"\([^"]*\)"$/\1/' || echo "")
            fi
            if [ -n "$VERSION" ]; then
                printf "  • %s (v%s)\n" "$PLUG_NAME" "$VERSION"
            else
                printf "  • %s\n" "$PLUG_NAME"
            fi
        fi
    done
fi

# Estado do grafo Understand-Anything (se houver)
if [ -f "$PROJECT_DIR/.understand-anything/knowledge-graph.json" ]; then
    echo ""
    if [ -f "$PROJECT_DIR/.understand-anything/meta.json" ] && command -v node &>/dev/null; then
        META_HASH=$(node -p "JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.understand-anything/meta.json','utf8')).gitCommitHash" 2>/dev/null || echo "")
        CURRENT_HASH=$(git -C "$PROJECT_DIR" rev-parse HEAD 2>/dev/null || echo "")
        if [ -n "$META_HASH" ] && [ "$META_HASH" = "$CURRENT_HASH" ]; then
            echo "📊 Grafo de conhecimento: ✅ sincronizado com HEAD"
        else
            echo "📊 Grafo de conhecimento: ⚠️  STALE (HEAD divergiu) — considere /understand --auto-update"
        fi
    else
        echo "📊 Grafo de conhecimento: presente em .understand-anything/"
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Viktor pronto. Descreva o que precisa."

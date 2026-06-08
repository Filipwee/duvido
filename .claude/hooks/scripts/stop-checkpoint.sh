#!/bin/bash
# stop-checkpoint.sh — executado quando sessão termina
# Lembra o usuário de atualizar contexto se houve mudanças

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
CHANGE_LOG="$PROJECT_DIR/.claude/state/change-log.md"

CHANGE_COUNT=0
if [ -f "$CHANGE_LOG" ]; then
    TODAY=$(date '+%Y-%m-%d')
    CHANGE_COUNT=$(grep -c "^- $TODAY" "$CHANGE_LOG" 2>/dev/null || echo 0)
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏁 Sessão encerrada"

if [ "$CHANGE_COUNT" -gt 0 ]; then
    echo "📝 $CHANGE_COUNT arquivo(s) modificado(s) hoje"
    echo "   Dica: rode /update-context para sincronizar a memória"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0

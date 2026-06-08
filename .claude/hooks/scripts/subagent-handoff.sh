#!/bin/bash
# subagent-handoff.sh — executado quando um subagente para
# Registra handoff para rastreabilidade.
#
# Nota: o payload do Claude Code para SubagentStop normalmente traz
# pouca informação semântica (`agent`/`session_id`). Por isso, o
# handoff RICO (task / entregável / status) é responsabilidade do
# Viktor, que escreve manualmente após cada delegação relevante.
# Este hook serve como pulso automático e identificador do agente
# quando o payload o disponibiliza.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
LOG_FILE="$PROJECT_DIR/.claude/state/handoff-log.md"

INPUT=$(cat)

# Tenta extrair os campos mais comuns. Se ausentes, marca como "n/d".
AGENT=$(echo "$INPUT" | grep -o '"agent":"[^"]*"' | head -1 | cut -d'"' -f4)
SUBAGENT=$(echo "$INPUT" | grep -o '"subagent_type":"[^"]*"' | head -1 | cut -d'"' -f4)
SESSION=$(echo "$INPUT" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4)

NAME="${AGENT:-${SUBAGENT:-n/d}}"
SESSION_SHORT="${SESSION:0:8}"
[ -z "$SESSION_SHORT" ] && SESSION_SHORT="n/d"

mkdir -p "$(dirname "$LOG_FILE")"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Formato: timestamp | agente | session | (handoff manual abaixo se houver)
echo "- $TIMESTAMP | auto | agente=$NAME | session=$SESSION_SHORT" >> "$LOG_FILE"

exit 0

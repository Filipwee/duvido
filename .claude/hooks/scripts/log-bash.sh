#!/bin/bash
# log-bash.sh — registra comandos bash executados

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
LOG_FILE="$PROJECT_DIR/.claude/state/bash-log.md"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

if [ -z "$COMMAND" ]; then
    exit 0
fi

mkdir -p "$(dirname "$LOG_FILE")"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "- $TIMESTAMP | \`$COMMAND\`" >> "$LOG_FILE"

exit 0

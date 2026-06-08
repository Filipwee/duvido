#!/bin/bash
# log-change.sh — registra mudanças de arquivo no log de auditoria

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
LOG_DIR="$PROJECT_DIR/.claude/state"
LOG_FILE="$LOG_DIR/change-log.md"

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Ignora arquivos de estado e log do próprio orquestrador
if [[ "$FILE_PATH" == *".claude/state/"* ]]; then
    exit 0
fi

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "- $TIMESTAMP | $FILE_PATH" >> "$LOG_FILE"

exit 0

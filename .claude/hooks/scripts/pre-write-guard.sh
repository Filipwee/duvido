#!/bin/bash
# pre-write-guard.sh — protege arquivos críticos antes de escrita
# Recebe o path do arquivo via stdin (JSON do Claude Code)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Bloqueia edição de lockfiles e arquivos de ambiente
BLOCKED_PATTERNS=(
    ".env"
    ".env.local"
    ".env.production"
    "*.pem"
    "*.key"
    "id_rsa"
    "id_ed25519"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "🔴 BLOQUEADO: tentativa de escrever em arquivo protegido: $FILE_PATH" >&2
        exit 1
    fi
done

# Avisa se estiver editando pom.xml (requer confirmação de Otávio)
if [[ "$FILE_PATH" == *"pom.xml"* ]]; then
    echo "⚠️  ATENÇÃO: modificando pom.xml — Otávio deve revisar antes do próximo build" >&2
fi

# Avisa se estiver em diretório de produção
if [[ "$FILE_PATH" == *"/prod/"* ]] || [[ "$FILE_PATH" == *"/production/"* ]]; then
    echo "⚠️  ATENÇÃO: escrevendo em path de produção: $FILE_PATH" >&2
fi

exit 0

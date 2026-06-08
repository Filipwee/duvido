#!/bin/bash
# pre-delegate-validate.sh — valida delegação de Viktor para agentes

INPUT=$(cat)
AGENT=$(echo "$INPUT" | grep -o '"agent":"[^"]*"' | cut -d'"' -f4)

VALID_AGENTS=("orchestrator" "planner" "scaffolder" "coder" "tester" "reviewer" "build" "context" "file")

if [ -z "$AGENT" ]; then
    exit 0
fi

IS_VALID=false
for valid in "${VALID_AGENTS[@]}"; do
    if [[ "$AGENT" == "$valid" ]]; then
        IS_VALID=true
        break
    fi
done

if [ "$IS_VALID" = false ]; then
    echo "⚠️  AVISO: agente '$AGENT' não reconhecido. Agentes válidos: ${VALID_AGENTS[*]}" >&2
fi

exit 0

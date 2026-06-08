#!/bin/bash
# pre-bash-firewall.sh — filtra comandos bash perigosos

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | cut -d'"' -f4)

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Padrões perigosos — bloqueia imediatamente
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "format c:"
    "rd /s /q c:\\"
    "curl.*| sh"
    "curl.*| bash"
    "wget.*| sh"
    "iex (iwr"
    "Invoke-Expression.*Invoke-WebRequest"
    "git push --force origin main"
    "git push --force origin master"
    "git reset --hard HEAD~"
    "DROP TABLE"
    "DROP DATABASE"
    "TRUNCATE"
)

COMMAND_LOWER=$(echo "$COMMAND" | tr '[:upper:]' '[:lower:]')

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    PATTERN_LOWER=$(echo "$pattern" | tr '[:upper:]' '[:lower:]')
    if [[ "$COMMAND_LOWER" == *"$PATTERN_LOWER"* ]]; then
        echo "🔴 FIREWALL: comando bloqueado por segurança: $COMMAND" >&2
        echo "   Padrão detectado: $pattern" >&2
        exit 1
    fi
done

# Operações de deploy/publish: avisa para confirmar (qualquer stack)
if [[ "$COMMAND" == *"mvn deploy"* ]] || [[ "$COMMAND" == *"mvn release"* ]] \
   || [[ "$COMMAND" == *"npm publish"* ]] || [[ "$COMMAND" == *"pnpm publish"* ]] || [[ "$COMMAND" == *"yarn publish"* ]] \
   || [[ "$COMMAND" == *"poetry publish"* ]] || [[ "$COMMAND" == *"twine upload"* ]] \
   || [[ "$COMMAND" == *"cargo publish"* ]] \
   || [[ "$COMMAND" == *"gh release"* ]] \
   || [[ "$COMMAND" == *"docker push"* ]]; then
    echo "⚠️  ATENÇÃO: operação de deploy/publish detectada — confirme antes de prosseguir" >&2
fi

exit 0

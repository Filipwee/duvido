#!/bin/bash
# post-write-format.sh — formata arquivo recém-escrito conforme o stack ativo.
# Identifica a ferramenta de format pela EXTENSÃO do arquivo, e roda silenciosamente
# se ela estiver disponível no ambiente.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Não bloqueia se a ferramenta não existir — só formata se estiver lá.
case "$FILE_PATH" in
    *.java)
        if command -v google-java-format &>/dev/null; then
            google-java-format --replace "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (google-java-format): $FILE_PATH"
        fi
        ;;
    *.py)
        if command -v ruff &>/dev/null; then
            ruff format "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (ruff): $FILE_PATH"
        elif command -v black &>/dev/null; then
            black -q "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (black): $FILE_PATH"
        fi
        ;;
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.md|*.css|*.html|*.yaml|*.yml)
        if command -v prettier &>/dev/null; then
            prettier --write --log-level=error "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (prettier): $FILE_PATH"
        elif command -v npx &>/dev/null && [ -f "package.json" ]; then
            npx --no-install prettier --write --log-level=error "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (prettier via npx): $FILE_PATH"
        fi
        ;;
    *.go)
        if command -v gofmt &>/dev/null; then
            gofmt -w "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (gofmt): $FILE_PATH"
        fi
        if command -v goimports &>/dev/null; then
            goimports -w "$FILE_PATH" 2>/dev/null
        fi
        ;;
    *.rs)
        if command -v rustfmt &>/dev/null; then
            rustfmt --edition 2021 "$FILE_PATH" 2>/dev/null && \
                echo "✅ Formatado (rustfmt): $FILE_PATH"
        fi
        ;;
    *.rb)
        if command -v rubocop &>/dev/null; then
            rubocop -A --no-color "$FILE_PATH" 2>/dev/null
        fi
        ;;
    *.kt|*.kts)
        if command -v ktlint &>/dev/null; then
            ktlint -F "$FILE_PATH" 2>/dev/null
        fi
        ;;
esac

exit 0

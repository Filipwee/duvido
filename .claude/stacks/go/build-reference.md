# Build Reference — Go

🪶 LIDO SOB DEMANDA por Max.

## Comandos (stdlib — sem build tool externo)

```bash
# Toolchain
go version    # >= 1.22

# Resolver/baixar dependências
go mod download
go mod tidy             # adiciona o que falta, remove o que não usa

# Compilar
go build ./...
go build -o bin/server ./cmd/server

# Compilar para outra plataforma (cross-compile — Go brilha aqui)
GOOS=linux   GOARCH=amd64 go build -o bin/server-linux-amd64 ./cmd/server
GOOS=darwin  GOARCH=arm64 go build -o bin/server-darwin-arm64 ./cmd/server
GOOS=windows GOARCH=amd64 go build -o bin/server.exe         ./cmd/server

# Build de produção — flags úteis
go build -trimpath -ldflags="-s -w" -o bin/server ./cmd/server

# Testes
go test ./...
go test -v -race -cover ./...

# Cobertura
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html

# Lint
golangci-lint run

# Format
gofmt -w .
goimports -w .

# Vet (análise estática nativa)
go vet ./...

# Rodar dev (sem hot reload — Go compila rápido)
go run ./cmd/server

# Hot reload (opcional — via cosmtrek/air)
air

# Atualizar deps
go get -u ./...
go mod tidy
```

## Classificação de erros de build

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `undefined: X` | Identificador não existe / falta import | Lucas |
| `cannot use X (type Y) as type Z` | Tipo incompatível | Lucas |
| `X declared and not used` | Variável não usada (Go é estrito) | Lucas |
| `imported and not used: "X"` | Import não usado | Lucas / `goimports` |
| `missing go.sum entry` | go.mod desatualizado | Max (`go mod tidy`) |
| `module X: not found` | Dependência faltando | Max (`go get X`) |

## Classificação de erros de teste

| Padrão | Diagnóstico | Quem corrige |
|--------|------------|-------------|
| `expected X, got Y` | Asserção falhou (bug ou teste errado) | Lucas/Sofia |
| `nil pointer dereference` | Stub mal feito ou ordem | Sofia |
| `race detected` | Concorrência insegura | Lucas |
| `test timed out after Xs` | Deadlock ou goroutine vazada | Lucas |

## Problemas comuns

| Problema | Solução |
|---------|---------|
| `go: cannot find main module` | Rodar no dir com `go.mod` |
| Compilação lenta primeira vez | `go mod download` (faz cache) |
| Testes lentos por package | `go test -p N` para limitar paralelismo |
| `GOPROXY` bloqueia download privado | Configurar `GOPRIVATE=github.com/empresa/*` |
| Windows: binário sem `.exe` | `GOOS=windows go build` ou cross-compile |
| Hot reload manual cansa | `cosmtrek/air` (opcional) |

## CI — exemplo (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true
      - run: go mod download
      - run: go vet ./...
      - uses: golangci/golangci-lint-action@v6
        with: { version: latest }
      - run: go test -race -coverprofile=coverage.out ./...
      - run: go build ./...
```

## `golangci-lint` config base (`.golangci.yml`)

```yaml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports
    - revive
    - gosec
    - bodyclose
    - errorlint
    - misspell
linters-settings:
  govet:
    enable: [shadow]
issues:
  exclude-use-default: false
```

## Formato do relatório

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `go test -race -cover ./...`

### Resultado
✅ PASSOU | ❌ FALHOU

### Erros encontrados
1. **Arquivo**: `internal/transactions/service.go:42`
   **Erro**: `cannot use req.UserID (type string) as type uuid.UUID`
   **Diagnóstico**: parse UUID está faltando
   **Ação**: Lucas adiciona uuid.Parse antes de criar Transaction

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X%
- Race detected: 0 (deve ser sempre zero)

### Binário
- Tamanho: XX MB (linux-amd64)

### Próximo passo
<frase>
```

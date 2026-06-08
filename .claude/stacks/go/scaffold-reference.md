# Scaffold Reference — Go

🪶 LIDO SOB DEMANDA por Bruno.

## Estrutura padrão (golang-standards/project-layout simplificado)

```
<projeto>/
├── go.mod
├── go.sum
├── README.md
├── .gitignore
├── .gitattributes
├── .golangci.yml
├── Makefile                         ← opcional mas útil
├── cmd/
│   └── server/
│       └── main.go                  ← entrypoint
├── internal/                        ← código privado do projeto
│   ├── config/
│   │   └── config.go
│   ├── transactions/                ← feature
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── repository_postgres.go
│   │   ├── model.go
│   │   ├── errors.go
│   │   └── *_test.go
│   └── shared/
│       ├── db/
│       │   └── pool.go
│       └── httperr/
│           └── httperr.go
├── migrations/                      ← golang-migrate ou similar
│   ├── 001_init.up.sql
│   └── 001_init.down.sql
└── .github/workflows/ci.yml
```

## `go.mod` base

```
module myapp

go 1.22

require (
    github.com/go-chi/chi/v5 v5.0.12
    github.com/go-playground/validator/v10 v10.20.0
    github.com/google/uuid v1.6.0
    github.com/jackc/pgx/v5 v5.5.5
    github.com/stretchr/testify v1.9.0
    github.com/golang-migrate/migrate/v4 v4.17.1
)
```

## `.gitignore`

```
# Binários compilados
bin/
*.exe
*.dll
*.so
*.dylib

# Test
*.test
*.out
coverage.html
coverage.out

# IDEs
.idea/
.vscode/

# Local
.env
.env.local

# OS
.DS_Store
Thumbs.db
```

## Comandos para Bruno usar

```bash
# Verificar Go
go version    # >= 1.22

# Iniciar módulo
mkdir myapp && cd myapp
go mod init myapp        # ou github.com/owner/repo se for público

# Estrutura
mkdir -p cmd/server internal/{config,transactions,shared/{db,httperr}} migrations

# Adicionar deps básicas
go get github.com/go-chi/chi/v5
go get github.com/google/uuid
go get github.com/jackc/pgx/v5
go get github.com/go-playground/validator/v10
go get github.com/stretchr/testify/require

# Init golangci-lint (cria .golangci.yml padrão)
golangci-lint run --no-config --out-format=tab 2>/dev/null || true
```

## `Makefile` opcional (atalhos)

```makefile
.PHONY: build test lint run

build:
	go build -o bin/server ./cmd/server

test:
	go test -race -cover ./...

lint:
	golangci-lint run

run:
	go run ./cmd/server

migrate-up:
	migrate -path migrations -database "$$DATABASE_URL" up

migrate-down:
	migrate -path migrations -database "$$DATABASE_URL" down 1
```

## Multiplataforma

- Go é multiplataforma por design — cross-compile resolve qualquer OS
- `.gitattributes`: `* text=auto eol=lf`
- Encoding UTF-8 default
- Em Windows, dev local roda em PowerShell ou Git Bash — comandos `make` precisam de make instalado (ou use scripts equivalentes)

## Dockerfile (multi-stage para imagem mínima)

```dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /bin/server ./cmd/server

FROM gcr.io/distroless/static:nonroot
COPY --from=build /bin/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

> Imagem final ~10-20 MB. Esse é um dos motivos para escolher Go em
> container-first deployments.

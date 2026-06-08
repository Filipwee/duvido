# Stack `go`

🪶 Stack para backend em Go — simplicidade, performance, deploy fácil.

## Linguagem / Framework

- **Linguagem**: Go 1.22+ (1.23 quando disponível — `range over int`, `for ... range func`)
- **HTTP**: `net/http` (stdlib) + `http.ServeMux` enhanced (1.22+ tem padrões + métodos)
- **Roteamento extra (opcional)**: `chi` (preferido, idiomático) ou `gorilla/mux` (legado)
- **Build/deps**: `go mod` (stdlib)
- **Test**: `testing` (stdlib) + `testify` (assertions/mocks, opcional)
- **Lint**: `golangci-lint`
- **Format**: `gofmt` (oficial) + `goimports`
- **DB**: `database/sql` + driver (`pgx` para Postgres) ou `sqlc` (gera código tipado de SQL)
- **Validação**: `go-playground/validator/v10`
- **Logger**: `slog` (stdlib desde 1.21)

## Quando usar

- Serviço de alta concorrência / baixa latência
- CLI compilada single-binary (cross-platform fácil)
- Worker, daemon, sidecar, agent — Go brilha em runtime simples
- Time familiar com simplicidade explícita

## Quando NÃO usar (alternativa)

- App com domínio rico e muita lógica de negócio → Java/Spring tem mais ferramentas maduras de modelagem
- Backend que precisa de ORM avançado com relações complexas → considerar `java-spring` ou `python-fastapi`
- Prototipagem ultra-rápida onde verbosidade incomoda → `python-fastapi`

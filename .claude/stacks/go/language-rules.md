# Regras de Linguagem — Go 1.22+

🪶 LIDO SOB DEMANDA por agentes técnicos.

## Versão e features

Go 1.22+ — use features modernas da stdlib:

```go
// ✅ ServeMux enhanced (1.22+) — sem precisar de roteador externo para casos simples
mux := http.NewServeMux()
mux.HandleFunc("POST /api/v1/transactions", createHandler)
mux.HandleFunc("GET /api/v1/transactions/{id}", getHandler)

// ✅ slog para logging estruturado (1.21+)
import "log/slog"
slog.Info("transação criada", "id", tx.ID, "userID", userID)

// ✅ errors.Join e errors.Is/As (1.20+)
return errors.Join(errSave, errAudit)

// ✅ context sempre como primeiro parâmetro
func (s *Service) FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
```

## Nomenclatura (oficial Go style)

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Pacote | lowercase, curto, sem underscore | `transactions`, `auth` |
| Arquivo | snake_case | `transaction_service.go` |
| Tipo exportado | PascalCase | `TransactionService` |
| Tipo não-exportado | camelCase | `internalState` |
| Função exportada | PascalCase | `FindByID` |
| Função não-exportada | camelCase | `findByID` |
| Constante | PascalCase (exportada) ou camelCase | `MaxRetries`, `defaultTimeout` |
| Interface | PascalCase, geralmente sufixo `-er` | `Reader`, `TransactionRepository` |

> **Go style:** receivers curtos (1-2 letras), nomes de variáveis curtos no
> escopo pequeno. NÃO traduza convenções de Java (não use `getX()`, use `X()`).

## Estrutura — `internal/` para código não-exportável

```
<projeto>/
├── go.mod
├── go.sum
├── cmd/
│   └── server/
│       └── main.go                  ← entrypoint(s)
├── internal/                        ← código não importável de fora
│   ├── config/
│   │   └── config.go
│   ├── transactions/                ← feature/package
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── model.go
│   │   └── *_test.go                ← testes ao lado
│   └── shared/
│       ├── httperr/
│       └── db/
└── pkg/                             ← biblioteca pública (se houver — opcional)
```

> **`internal/` vs `pkg/`**: convenção forte da comunidade — `internal/` para
> tudo que não é API pública do repo. `pkg/` só se houver export consciente.

## Regras de código

- Máximo **40 linhas** por função (Go é mais verboso por design — mais permissivo)
- Máximo **500 linhas** por arquivo (split em múltiplos `*.go` no mesmo pacote é grátis)
- **Zero** `interface{}` (use `any` — alias da stdlib desde 1.18)
- **Zero** `_ =` para ignorar erro sem comentário justificando
- **Zero** panic em código de servidor — só em `init()` e casos verdadeiramente irrecuperáveis
- **Zero** `fmt.Println` em código de produção — use `slog`
- **Sempre** `context.Context` como primeiro parâmetro em funções que fazem I/O
- **Sempre** `errors.Is` / `errors.As` para comparar erros (não `==`)

## Error handling — explícito sempre

```go
// ✅ Padrão Go — erro é valor, sempre verificado
user, err := repo.FindByID(ctx, id)
if err != nil {
    return fmt.Errorf("buscar user %s: %w", id, err)  // wrap com %w
}

// ✅ Sentinel errors
var ErrNotFound = errors.New("not found")

// ✅ Custom error types quando há contexto estruturado
type BusinessRuleError struct {
    Code    string
    Message string
}
func (e *BusinessRuleError) Error() string { return e.Message }
```

## Goroutines — sempre com cancelamento

```go
// ❌ Goroutine sem context — vaza ao morrer o request
go doStuff()

// ✅ context.Context controla o ciclo de vida
go func(ctx context.Context) {
    select {
    case <-ctx.Done():
        return
    case result := <-doStuff(ctx):
        process(result)
    }
}(ctx)
```

## Generics — só quando o tipo varia de verdade

```go
// ✅ Função genuinamente genérica
func Map[T, U any](s []T, fn func(T) U) []U {
    out := make([]U, len(s))
    for i, v := range s {
        out[i] = fn(v)
    }
    return out
}

// ❌ Generics por enfeite — em Go é frequentemente over-engineering
// Comunidade Go prefere duplicação curta a abstração inadequada
```

## Idiom: receiver pointer vs value

- Receiver **pointer** (`func (s *Service)`) — se o método modifica o struct ou se o struct é grande
- Receiver **value** (`func (s Service)`) — para tipos pequenos imutáveis (e.g., `time.Time`)
- **Consistência**: se algum método usa pointer, todos usam pointer

## Imports — `goimports` organiza

```go
import (
    // 1. stdlib
    "context"
    "fmt"
    "net/http"

    // 2. terceiros
    "github.com/go-chi/chi/v5"
    "github.com/google/uuid"

    // 3. internos do projeto
    "myapp/internal/transactions"
)
```

## Format de log estruturado (slog)

```go
import "log/slog"

slog.Info("transação criada", "id", tx.ID, "user_id", userID)
slog.Error("falha ao processar", "id", id, "err", err)

// Logger configurado uma vez (handler JSON em prod)
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
slog.SetDefault(logger)
```

## Versionamento de API

- `/api/v1/recurso` na URL
- Tag versão no struct response se útil
- Mantém v1 funcional até v2 estar consolidado

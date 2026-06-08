# Skeletons de Teste — Go / testing

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`.

## Test framework

- **Framework**: `testing` (stdlib)
- **Assertions**: `testify/require` e `testify/assert` (opcional mas recomendado)
- **Mocks**: testify/mock, ou gomock, ou interface manual (preferido em Go)
- **HTTP**: `httptest` (stdlib)
- **DB**: Testcontainers (`testcontainers-go`) ou SQLite com `mattn/go-sqlite3` para slice
- **Coverage**: `go test -cover` (built-in)

## Service unitário (mock de repo via interface)

```go
// internal/transactions/service_test.go
package transactions_test

import (
    "context"
    "errors"
    "log/slog"
    "testing"

    "github.com/google/uuid"
    "github.com/stretchr/testify/require"

    "myapp/internal/transactions"
)

// Stub manual — preferido em Go para mocks simples
type stubRepository struct {
    findByIDFunc func(ctx context.Context, id uuid.UUID) (*transactions.Transaction, error)
    saveFunc     func(ctx context.Context, tx *transactions.Transaction) error
}

func (s *stubRepository) FindByID(ctx context.Context, id uuid.UUID) (*transactions.Transaction, error) {
    return s.findByIDFunc(ctx, id)
}
func (s *stubRepository) Save(ctx context.Context, tx *transactions.Transaction) error {
    return s.saveFunc(ctx, tx)
}

func TestService_FindByID_NotFound(t *testing.T) {
    // Given
    repo := &stubRepository{
        findByIDFunc: func(_ context.Context, _ uuid.UUID) (*transactions.Transaction, error) {
            return nil, nil
        },
    }
    svc := transactions.NewService(repo, slog.Default())

    // When
    _, err := svc.FindByID(context.Background(), uuid.New())

    // Then
    require.Error(t, err)
    require.True(t, errors.Is(err, transactions.ErrNotFound))
}

func TestService_Create_RejectsNegativeAmount(t *testing.T) {
    svc := transactions.NewService(&stubRepository{}, slog.Default())
    _, err := svc.Create(context.Background(), transactions.TransactionRequest{
        UserID:      uuid.NewString(),
        Description: "x",
        Amount:      -1,
    })
    require.Error(t, err)
    require.True(t, errors.Is(err, transactions.ErrInvalidRequest))
}
```

## Handler HTTP (com httptest)

```go
// internal/transactions/handler_test.go
package transactions_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/go-chi/chi/v5"
    "github.com/stretchr/testify/require"

    "myapp/internal/transactions"
)

func TestHandler_Create_Returns201(t *testing.T) {
    svc := transactions.NewService(&stubRepository{
        saveFunc: func(_ context.Context, _ *transactions.Transaction) error { return nil },
    }, slog.Default())

    r := chi.NewRouter()
    transactions.NewHandler(svc).Mount(r)

    body, _ := json.Marshal(map[string]any{
        "userId":      uuid.NewString(),
        "description": "Almoço",
        "amount":      45.5,
    })
    req := httptest.NewRequest(http.MethodPost, "/transactions", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    r.ServeHTTP(w, req)
    require.Equal(t, http.StatusCreated, w.Code)
}
```

## Table-driven test (idiom de Go)

```go
func TestClassify(t *testing.T) {
    cases := []struct {
        name     string
        amount   float64
        expected string
    }{
        {"valor positivo pequeno", 100.0, "APPROVED"},
        {"zero",                   0.0,   "REJECTED"},
        {"negativo",              -10.0,  "REJECTED"},
        {"valor alto",            9999.99, "PENDING_REVIEW"},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            require.Equal(t, tc.expected, classify(tc.amount))
        })
    }
}
```

## Repository com DB de teste (sqlite ou testcontainers)

```go
func setupTestDB(t *testing.T) *pgxpool.Pool {
    t.Helper()
    ctx := context.Background()
    container, err := postgres.RunContainer(ctx, /* ... */)
    require.NoError(t, err)
    t.Cleanup(func() { _ = container.Terminate(ctx) })

    connStr, _ := container.ConnectionString(ctx)
    pool, _ := pgxpool.New(ctx, connStr)
    runMigrations(t, pool)
    return pool
}

func TestRepository_SaveAndFind(t *testing.T) {
    pool := setupTestDB(t)
    repo := transactions.NewPostgresRepository(pool)
    /* ... */
}
```

## Comandos

```bash
# Rodar todos
go test ./...

# Verbose
go test -v ./...

# Pacote específico
go test ./internal/transactions

# Teste específico
go test ./internal/transactions -run TestService_Create

# Cobertura
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Race detector (sempre vale a pena em desenvolvimento)
go test -race ./...

# Benchmark
go test -bench=. -benchmem ./internal/transactions
```

## Cobertura mínima

| Camada | Cobertura mínima |
|--------|-----------------|
| Service | 90% |
| Handler | 80% |
| Repository | 70% |

## Regras invioláveis

- Test files ao lado do código (`foo.go` + `foo_test.go` mesmo pacote OU `foo_test` para black-box)
- Sem `time.Sleep` — usa `context.WithTimeout` + canais
- `t.Helper()` em helpers de teste — stack trace aponta pro caller
- `t.Cleanup()` em vez de `defer` em test setup
- `-race` rodando em CI sempre
- Erro testado tanto com `Is/As` quanto comparando comportamento esperado

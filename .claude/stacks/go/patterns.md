# Padrões — Go

🪶 LIDO SOB DEMANDA por Lucas e Otávio.

## Service como struct com dependências (DI manual)

Go não tem framework de DI por convenção — é tudo explícito via construtor:

```go
package transactions

import (
    "context"
    "fmt"
    "log/slog"

    "github.com/google/uuid"
)

type Service struct {
    repo Repository
    log  *slog.Logger
}

func NewService(repo Repository, log *slog.Logger) *Service {
    return &Service{repo: repo, log: log}
}

func (s *Service) FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error) {
    tx, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("transaction service: find by id %s: %w", id, err)
    }
    if tx == nil {
        return nil, ErrNotFound
    }
    return tx, nil
}
```

## Repository como interface (consumida no service)

```go
// Interface declarada onde é USADA (no service), não onde é implementada
// — Go idiom: "accept interfaces, return structs"

type Repository interface {
    FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
    Save(ctx context.Context, tx *Transaction) error
    ListByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*Transaction, error)
}

// Implementação concreta retorna struct, não interface
type PostgresRepository struct {
    db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
    return &PostgresRepository{db: db}
}

func (r *PostgresRepository) FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error) {
    const query = `SELECT id, description, amount, created_at FROM transactions WHERE id = $1`
    var tx Transaction
    err := r.db.QueryRowContext(ctx, query, id).Scan(&tx.ID, &tx.Description, &tx.Amount, &tx.CreatedAt)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, nil   // not found não é erro de infra
    }
    if err != nil {
        return nil, fmt.Errorf("query find by id: %w", err)
    }
    return &tx, nil
}
```

## Handler HTTP (com `chi` para conveniência de path params)

```go
package transactions

import (
    "encoding/json"
    "errors"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/google/uuid"

    "myapp/internal/shared/httperr"
)

type Handler struct {
    svc *Service
}

func NewHandler(svc *Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Mount(r chi.Router) {
    r.Post("/transactions", h.Create)
    r.Get("/transactions/{id}", h.Get)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    var req TransactionRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        httperr.Write(w, http.StatusBadRequest, "INVALID_JSON", err.Error())
        return
    }
    if err := req.Validate(); err != nil {
        httperr.Write(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
        return
    }

    result, err := h.svc.Create(r.Context(), req)
    if err != nil {
        httperr.WriteFromError(w, err)
        return
    }
    httperr.WriteJSON(w, http.StatusCreated, result)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    id, err := uuid.Parse(chi.URLParam(r, "id"))
    if err != nil {
        httperr.Write(w, http.StatusBadRequest, "INVALID_ID", "id deve ser UUID")
        return
    }
    tx, err := h.svc.FindByID(r.Context(), id)
    if errors.Is(err, ErrNotFound) {
        httperr.Write(w, http.StatusNotFound, "NOT_FOUND", "transação não encontrada")
        return
    }
    if err != nil {
        httperr.WriteFromError(w, err)
        return
    }
    httperr.WriteJSON(w, http.StatusOK, tx)
}
```

## Erros como valores — sentinel + wrap

```go
package transactions

import "errors"

var (
    ErrNotFound        = errors.New("transaction not found")
    ErrInvalidStatus   = errors.New("invalid status transition")
    ErrAmountNegative  = errors.New("amount must be positive")
)

// Wrap com contexto preservando a cadeia
func (s *Service) Process(ctx context.Context, id uuid.UUID) error {
    if err := s.validate(id); err != nil {
        return fmt.Errorf("process %s: %w", id, err)   // %w preserva ErrXXX
    }
    return nil
}

// Consumidor verifica com errors.Is
if errors.Is(err, transactions.ErrNotFound) { /* ... */ }
```

## Validação — `go-playground/validator` em DTOs

```go
import "github.com/go-playground/validator/v10"

type TransactionRequest struct {
    Description string  `json:"description" validate:"required,min=1,max=200"`
    Amount      float64 `json:"amount"      validate:"required,gt=0"`
    UserID      string  `json:"userId"      validate:"required,uuid"`
}

var validate = validator.New(validator.WithRequiredStructEnabled())

func (r TransactionRequest) Validate() error {
    return validate.Struct(r)
}
```

## Config — flag/env com defaults

```go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    Port        int
    DatabaseURL string
    JWTSecret   string
    LogLevel    string
}

func Load() (*Config, error) {
    port, err := strconv.Atoi(envOr("PORT", "8080"))
    if err != nil {
        return nil, fmt.Errorf("invalid PORT: %w", err)
    }
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        return nil, errors.New("DATABASE_URL is required")
    }
    return &Config{
        Port:        port,
        DatabaseURL: dbURL,
        JWTSecret:   mustEnv("JWT_SECRET"),
        LogLevel:    envOr("LOG_LEVEL", "info"),
    }, nil
}
```

## Graceful shutdown

```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: router}

    go func() {
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            slog.Error("server died", "err", err)
            os.Exit(1)
        }
    }()

    sig := make(chan os.Signal, 1)
    signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
    <-sig

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        slog.Error("graceful shutdown failed", "err", err)
    }
}
```

## Context propagation — sempre

Toda função que faz I/O recebe `ctx context.Context` como primeiro parâmetro.
Funções puras (transformação de dados) não precisam.

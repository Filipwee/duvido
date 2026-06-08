# Skeletons de Código — Go

🪶 LIDO SOB DEMANDA por Lucas.

## main.go

```go
// cmd/server/main.go
package main

import (
    "context"
    "errors"
    "log/slog"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"

    "myapp/internal/config"
    "myapp/internal/shared/db"
    "myapp/internal/transactions"
)

func main() {
    cfg, err := config.Load()
    if err != nil {
        slog.Error("config load failed", "err", err)
        os.Exit(1)
    }

    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
    slog.SetDefault(logger)

    pool, err := db.NewPool(cfg.DatabaseURL)
    if err != nil {
        slog.Error("db connect failed", "err", err)
        os.Exit(1)
    }
    defer pool.Close()

    repo := transactions.NewPostgresRepository(pool)
    svc := transactions.NewService(repo, slog.Default())
    handler := transactions.NewHandler(svc)

    r := chi.NewRouter()
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(30 * time.Second))

    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        _, _ = w.Write([]byte(`{"status":"ok"}`))
    })

    r.Route("/api/v1", handler.Mount)

    srv := &http.Server{
        Addr:              ":" + cfg.Port,
        Handler:           r,
        ReadHeaderTimeout: 10 * time.Second,
    }

    go func() {
        slog.Info("server started", "addr", srv.Addr)
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            slog.Error("server died", "err", err)
            os.Exit(1)
        }
    }()

    sig := make(chan os.Signal, 1)
    signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
    <-sig

    slog.Info("shutting down")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        slog.Error("graceful shutdown failed", "err", err)
    }
}
```

## Model

```go
// internal/transactions/model.go
package transactions

import (
    "time"

    "github.com/google/uuid"
)

type Transaction struct {
    ID          uuid.UUID `json:"id"`
    UserID      uuid.UUID `json:"userId"`
    Description string    `json:"description"`
    Amount      float64   `json:"amount"`        // ou usar shopspring/decimal para precisão
    CreatedAt   time.Time `json:"createdAt"`
}

type TransactionRequest struct {
    UserID      string  `json:"userId"      validate:"required,uuid"`
    Description string  `json:"description" validate:"required,min=1,max=200"`
    Amount      float64 `json:"amount"      validate:"required,gt=0"`
}
```

## Service

```go
// internal/transactions/service.go
package transactions

import (
    "context"
    "errors"
    "fmt"
    "log/slog"

    "github.com/google/uuid"
)

var (
    ErrNotFound       = errors.New("transaction not found")
    ErrInvalidRequest = errors.New("invalid request")
)

type Repository interface {
    FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
    Save(ctx context.Context, tx *Transaction) error
}

type Service struct {
    repo Repository
    log  *slog.Logger
}

func NewService(repo Repository, log *slog.Logger) *Service {
    return &Service{repo: repo, log: log}
}

func (s *Service) Create(ctx context.Context, req TransactionRequest) (*Transaction, error) {
    if err := req.Validate(); err != nil {
        return nil, fmt.Errorf("%w: %w", ErrInvalidRequest, err)
    }

    userID, err := uuid.Parse(req.UserID)
    if err != nil {
        return nil, fmt.Errorf("parse user id: %w", err)
    }

    tx := &Transaction{
        ID:          uuid.New(),
        UserID:      userID,
        Description: req.Description,
        Amount:      req.Amount,
    }
    if err := s.repo.Save(ctx, tx); err != nil {
        return nil, fmt.Errorf("save transaction: %w", err)
    }
    s.log.Info("transaction created", "id", tx.ID, "user_id", userID)
    return tx, nil
}

func (s *Service) FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error) {
    tx, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("find by id %s: %w", id, err)
    }
    if tx == nil {
        return nil, ErrNotFound
    }
    return tx, nil
}
```

## Repository (Postgres com pgx)

```go
// internal/transactions/repository_postgres.go
package transactions

import (
    "context"
    "errors"
    "fmt"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
    pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
    return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) FindByID(ctx context.Context, id uuid.UUID) (*Transaction, error) {
    const query = `
        SELECT id, user_id, description, amount, created_at
        FROM transactions WHERE id = $1
    `
    var tx Transaction
    err := r.pool.QueryRow(ctx, query, id).Scan(
        &tx.ID, &tx.UserID, &tx.Description, &tx.Amount, &tx.CreatedAt,
    )
    if errors.Is(err, pgx.ErrNoRows) {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("query: %w", err)
    }
    return &tx, nil
}

func (r *PostgresRepository) Save(ctx context.Context, tx *Transaction) error {
    const query = `
        INSERT INTO transactions (id, user_id, description, amount, created_at)
        VALUES ($1, $2, $3, $4, NOW())
    `
    _, err := r.pool.Exec(ctx, query, tx.ID, tx.UserID, tx.Description, tx.Amount)
    if err != nil {
        return fmt.Errorf("insert: %w", err)
    }
    return nil
}
```

## HTTP handler + erros como JSON

```go
// internal/shared/httperr/httperr.go
package httperr

import (
    "encoding/json"
    "errors"
    "log/slog"
    "net/http"

    "myapp/internal/transactions"
)

type Response struct {
    Code    string `json:"code"`
    Message string `json:"message"`
}

func Write(w http.ResponseWriter, status int, code, message string) {
    WriteJSON(w, status, Response{Code: code, Message: message})
}

func WriteJSON(w http.ResponseWriter, status int, body any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if err := json.NewEncoder(w).Encode(body); err != nil {
        slog.Error("write json failed", "err", err)
    }
}

func WriteFromError(w http.ResponseWriter, err error) {
    switch {
    case errors.Is(err, transactions.ErrNotFound):
        Write(w, http.StatusNotFound, "NOT_FOUND", err.Error())
    case errors.Is(err, transactions.ErrInvalidRequest):
        Write(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
    default:
        slog.Error("unexpected error", "err", err)
        Write(w, http.StatusInternalServerError, "INTERNAL_ERROR", "erro interno")
    }
}
```

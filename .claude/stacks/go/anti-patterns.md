# Anti-Patterns — Go

🪶 LIDO SOB DEMANDA. Universais vivem em `rules/wisdom/anti-patterns.md`.

## Ignorar erro silenciosamente

```go
// ❌ Erro descartado — futuro tempo perdido debugando
result, _ := someOp()

// ✅ Sempre verificar; se realmente quiser ignorar, comente o porquê
result, err := someOp()
if err != nil {
    return fmt.Errorf("some op: %w", err)
}
```

## `panic` em código de servidor

```go
// ❌ Mata o processo inteiro — afeta outros requests
func handler(w http.ResponseWriter, r *http.Request) {
    if r.Body == nil {
        panic("body required")
    }
}

// ✅ Retorna erro / HTTP error
if r.Body == nil {
    httperr.Write(w, http.StatusBadRequest, "MISSING_BODY", "body é obrigatório")
    return
}
```

> Exceções legítimas para `panic`: `init()` quando config crítica falta;
> programming errors (assertion violada) que indicam bug, não input ruim.

## Goroutine sem cancelamento (vazamento)

```go
// ❌ Roda pra sempre — vaza ao morrer o request
go func() {
    for {
        doStuff()
    }
}()

// ✅ Respeita context
go func(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            doStuff()
        }
    }
}(ctx)
```

## Comparar erro com `==`

```go
// ❌ Não pega erro wrapped
if err == sql.ErrNoRows { /* ... */ }

// ✅ errors.Is anda a cadeia de %w
if errors.Is(err, sql.ErrNoRows) { /* ... */ }
```

## `interface{}` (use `any`)

```go
// ❌ Estilo antigo
func process(data interface{}) {}

// ✅ Desde Go 1.18 — same thing, mas idiomático moderno
func process(data any) {}
```

## Interface declarada onde é implementada

```go
// ❌ Interface no pacote do struct concreto
package repo

type Repository interface { /* ... */ }
type PostgresRepo struct{}
func (r *PostgresRepo) FindByID(...) (...) { /* ... */ }

// ✅ Interface onde é CONSUMIDA — service.go declara o que precisa
package service

type repository interface {
    FindByID(ctx context.Context, id uuid.UUID) (*Tx, error)
}
type Service struct { repo repository }
```

## `init()` para lógica complexa

```go
// ❌ init faz I/O ou inicialização que pode falhar — debug horrível
func init() {
    db = mustConnect()
}

// ✅ Inicialização explícita em main() ou função New*
func main() {
    db, err := connect()
    if err != nil { log.Fatal(err) }
    /* ... */
}
```

## Receiver pointer + value misturados

```go
// ❌ Mistura — Go vai cuspir warning, e pior, comportamento inesperado
func (s Service) Foo() {}   // value receiver
func (s *Service) Bar() {}  // pointer receiver — agora a interface não é satisfeita por value

// ✅ Consistência: tudo pointer (default seguro) OU tudo value (tipo imutável pequeno)
func (s *Service) Foo() {}
func (s *Service) Bar() {}
```

## `fmt.Println` debug esquecido

```go
// ❌ Vai pra stdout em produção, sem nível, sem contexto
fmt.Println("got here", x)

// ✅ slog com contexto
slog.Debug("processing", "x", x)
// ou remove antes do commit (pre-commit hook + revisão)
```

## SQL string-concatenado (mesmo "interno")

```go
// ❌ SQL injection — sempre, em qualquer linguagem
db.Query(fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", id))

// ✅ Placeholders
db.Query("SELECT * FROM users WHERE id = $1", id)
```

## `for ... range` sem capturar valor

```go
// ❌ Em Go < 1.22, `v` era reutilizada — bug clássico com goroutines
for _, v := range items {
    go func() { process(v) }()   // bug: todos veem o último v
}

// ✅ Go 1.22+ — cada iteração tem nova variável (corrigido); mas para portabilidade:
for _, v := range items {
    v := v   // shadowing intencional
    go func() { process(v) }()
}
```

## Channel sem buffer + envio sem leitor

```go
// ❌ Deadlock
ch := make(chan int)
ch <- 1   // bloqueia até alguém ler — nunca

// ✅ Pensar em quem consome antes de produzir
ch := make(chan int, 1)   // buffered se cabe 1
go func() { ch <- 1 }()
v := <-ch
```

## Logging que vaza PII

```go
// ❌ LGPD/GDPR violation
slog.Info("login", "cpf", user.CPF, "password", password)

// ✅ Mascarar / não logar
slog.Info("login attempt", "user_id", user.ID)
```

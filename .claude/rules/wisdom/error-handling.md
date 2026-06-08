# Error Handling — Estratégias Universais

🪶 LIDO SOB DEMANDA por Lucas e Otávio.

Princípios independentes de linguagem. Padrões específicos (try/catch vs Result
vs panic/recover vs exception hierarchy) ficam no `stacks/<active>/patterns.md`.

## Princípio central

Erro é **informação para quem opera o sistema**. Engolir é roubar essa
informação; vazar stack trace para o usuário é vazar informação demais.

## Hierarquia de erros do projeto (qualquer linguagem)

Categorize os erros que **atravessam a fronteira** (HTTP/CLI/RPC) em famílias.
Os nomes podem variar, mas a semântica é universal:

| Categoria | HTTP | Semântica |
|---|---|---|
| `NotFound` | 404 | Recurso identificado por id/chave não existe |
| `BusinessRule` | 422 | Input válido sintaticamente, mas viola regra de negócio |
| `Validation` | 400 | Input malformado (tipo errado, campo obrigatório) |
| `Conflict` | 409 | Recurso já existe / estado incompatível |
| `Unauthorized` | 401/403 | Sem autenticação / sem permissão |
| `External` | 502/504 | Dependência externa falhou |
| `Internal` | 500 | Bug nosso |

Cada stack implementa essa hierarquia de forma idiomática:
- **Java/Spring**: classes que herdam de `RuntimeException` + `@RestControllerAdvice`
- **Python/FastAPI**: classes Python + `app.exception_handler(...)`
- **Node/TS**: classes que herdam `Error` + handler global
- **Go**: sentinel errors (`var ErrNotFound = errors.New(...)`) + tradução para HTTP no handler
- **Rust**: enum + `From` para conversão de I/O

## Como lançar com contexto (universal)

```
// ✅ Mensagem inclui o id ou chave; preserva a causa
throw new ResourceNotFound("transaction not found: id=" + id, originalError)
return fmt.Errorf("find by id %s: %w", id, err)      // Go
raise ResourceNotFound(f"transação não encontrada: {id}") from err  # Python
throw new ResourceNotFoundError(`transação não encontrada: ${id}`, { cause: err })  // Node

// ❌ Sem contexto — impossível debugar em produção
throw new Exception("erro")
return errors.New("error")
raise Exception("erro")
throw new Error("erro")
```

## Resposta de erro padrão (qualquer linguagem)

Recomendamos formato consistente em qualquer linguagem:

```json
{
  "code": "NOT_FOUND",
  "message": "transação não encontrada: id=...",
  "timestamp": "2026-05-29T12:00:00Z",
  "details": null
}
```

Ou seguir [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807):

```json
{
  "type": "https://example.com/probs/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "transação não encontrada: id=...",
  "instance": "/api/v1/transactions/xxx"
}
```

O formato fica em `project-profile.md` → `api.error_format`.

## Regras invioláveis (universais)

- **Engolir erro silenciosamente** (catch vazio, `_ = err`, exception ignorada) → BLOQUEADOR de review.
- **Logar erro SEMPRE com a causa original anexada** — stack trace ou objeto com `err`/`cause`, dependendo do logger do stack.
- **Nunca expor stack trace ao cliente** — só nos logs internos.
- **Errors são valores em algumas linguagens** (Go, Rust) e exceptions em outras (Java, Python, TS) — respeite o idiom. Não tente simular Result em Java se for usar para tudo; não tente lançar exception em Go onde idiomático é retornar erro.
- **Em código transacional**, certifique-se de que a estratégia de rollback do stack reage à exceção/erro corretamente (em Java/Spring, só `RuntimeException` faz rollback automático).

## Estratégias de erro por linguagem (referência rápida)

| Família | Java | Python | TS/Node | Go |
|---|---|---|---|---|
| Estilo principal | Exception hierarchy | Exception hierarchy | Exception hierarchy ou Result | Multiple return `(T, error)` |
| Preservar causa | `new Ex(msg, cause)` | `raise Ex(msg) from cause` | `new Error(msg, { cause })` | `fmt.Errorf("...: %w", err)` |
| Comparar erro | `instanceof` | `isinstance` | `instanceof` | `errors.Is/As` |
| Erro "não-erro" (not found) | `Optional.empty()` | `return None` | `return null` | `return nil, nil` |

Detalhes do stack ativo em `stacks/<active>/patterns.md` e `anti-patterns.md`.

## Catch and Ignore — universalmente proibido

```
// ❌ qualquer linguagem
try:
    risky()
except:
    pass

try { risky(); } catch {}

result, _ := risky()  // sem comentário justificando

// ✅ ou trata, ou propaga com contexto
```

Se o erro é mesmo descartável (timer cleanup, log opcional), comente o porquê
explicitamente no código.

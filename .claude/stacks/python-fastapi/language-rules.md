# Regras de Linguagem — Python 3.11+ / FastAPI

🪶 LIDO SOB DEMANDA por agentes técnicos.

## Versão e features obrigatórias

Python 3.11+ — use os recursos modernos:

```python
# ✅ Match-case (3.10+)
match status:
    case "PENDING":  label = "Pendente"
    case "APPROVED": label = "Aprovado"
    case _:          label = "Desconhecido"

# ✅ Type hints completos (PEP 484/585/604)
def find_by_id(id: UUID) -> Transaction | None: ...

# ✅ Async sempre que I/O (FastAPI roda async-first)
async def list_transactions(user_id: UUID) -> list[Transaction]:
    return await repo.list_by_user(user_id)

# ✅ Dataclasses ou Pydantic models — não dict solto
from pydantic import BaseModel, Field

class TransactionRequest(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0, decimal_places=2)

# ✅ Walrus quando ajuda
if (user := repo.find_by_id(user_id)) is not None:
    process(user)
```

## Nomenclatura (PEP 8)

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classe / Type | PascalCase | `TransactionService` |
| Função / método | snake_case | `find_by_id` |
| Variável | snake_case | `total_amount` |
| Constante | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Módulo | snake_case curto | `transaction_service.py` |
| Pacote | snake_case curto | `transactions/` |
| Privado | prefixo `_` | `_internal_helper` |

## Estrutura de módulos — package by feature

```
app/
├── main.py                          ← FastAPI app + routers
├── core/                            ← config, db, security, exceptions
│   ├── config.py                    ← Pydantic Settings
│   ├── database.py                  ← engine + session
│   ├── security.py                  ← JWT, hashing
│   └── exceptions.py
├── transactions/                    ← feature
│   ├── __init__.py
│   ├── router.py                    ← endpoints
│   ├── service.py                   ← lógica de negócio
│   ├── repository.py                ← acesso a dados
│   ├── models.py                    ← SQLAlchemy
│   ├── schemas.py                   ← Pydantic (request/response)
│   └── tests/
└── users/                           ← feature
    └── ...
```

## Regras de código

- Máximo **20 linhas** por função (PEP 8 sugere flexibilidade; o time fixa em 20)
- Máximo **300 linhas** por módulo (Python tem menos overhead que Java; cap maior)
- Máximo **4 parâmetros posicionais** (keyword-only acima — use `*`)
- **Zero** `from x import *` — imports explícitos
- **Zero** `Any` sem justificativa em comentário
- **Zero** mutable default args (`def f(x=[])` é bug clássico)
- **Zero** uso de `print` em código de produção — use `logging`
- Type hints **obrigatórios** em funções públicas e atributos de classe

## Type checking — mypy strict ou pyright strict

`pyproject.toml`:

```toml
[tool.mypy]
strict = true
python_version = "3.11"
disallow_any_explicit = true
warn_return_any = true
warn_unused_ignores = true

[tool.pyright]
typeCheckingMode = "strict"
```

## Async — quando usar

```python
# ✅ Sempre que houver I/O — endpoints, DB, HTTP outbound
@router.get("/transactions/{id}")
async def get_transaction(id: UUID, svc: TransactionService = Depends()) -> TransactionResponse:
    return await svc.find_by_id(id)

# ✅ Funções utilitárias puras (CPU) — não precisam ser async
def calculate_fee(amount: Decimal) -> Decimal:
    return amount * Decimal("0.025")
```

**Não misture sync e async no mesmo caminho** — chamar função sync bloqueante
dentro de async trava o event loop. Use `asyncio.to_thread` para isolar.

## Decimal — regras obrigatórias para monetário

```python
from decimal import Decimal

# ✅ Monetário sempre Decimal, nunca float
amount: Decimal = Decimal("100.50")

# ✅ Construção segura — sempre via string
Decimal("0.1")    # → 0.1
Decimal(0.1)      # ❌ → 0.1000000000000000055511151231257827021181583404541015625

# ✅ Operações com escala
amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
```

## Pydantic v2 — validação

```python
from pydantic import BaseModel, Field, field_validator

class TransactionRequest(BaseModel):
    model_config = {"str_strip_whitespace": True}

    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)
    transaction_date: date

    @field_validator("transaction_date")
    @classmethod
    def not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("data não pode ser futura")
        return v
```

## Format de log estruturado

```python
import logging
log = logging.getLogger(__name__)

# ✅ extra= para contexto estruturado (JSON logger consome)
log.info("transação criada", extra={"id": str(tx.id), "user_id": str(user_id)})
log.error("falha ao processar transação", extra={"id": str(id)}, exc_info=True)
```

Configurar `python-json-logger` em produção para logs estruturados.

## Versionamento de API

- Versão na URL: `/api/v1/recurso`
- FastAPI suporta múltiplos routers — cada versão pode ter um
- Use `deprecated=True` em endpoint obsoleto antes de remover

## Imports — ordem (ruff/isort cuida)

```python
# 1. stdlib
from datetime import date
from uuid import UUID

# 2. terceiros
from fastapi import APIRouter, Depends
from pydantic import BaseModel

# 3. interno (absolute)
from app.core.database import get_session
from app.transactions.service import TransactionService
```

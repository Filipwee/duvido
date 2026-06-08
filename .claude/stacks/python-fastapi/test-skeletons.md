# Skeletons de Teste — Python / pytest

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`.

## Test framework

- **Framework**: pytest 8+
- **Async**: pytest-asyncio
- **HTTP client**: httpx + FastAPI `TestClient` / `AsyncClient`
- **DB para teste**: SQLite in-memory ou Postgres via Testcontainers
- **Coverage**: pytest-cov
- **Fixtures**: pytest fixtures + factory-boy (opcional)

## Configuração de pytest (`pyproject.toml`)

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-q --strict-markers --strict-config"
filterwarnings = ["error"]
```

## Teste unitário de service (com mock de repo)

```python
# tests/transactions/test_service.py
from decimal import Decimal
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.core.exceptions import ResourceNotFound
from app.transactions.schemas import TransactionRequest
from app.transactions.service import TransactionService


@pytest.mark.asyncio
async def test_find_by_id_raises_when_not_found() -> None:
    # Given
    session = AsyncMock()
    svc = TransactionService.__new__(TransactionService)
    svc.session = session
    svc.repo = AsyncMock()
    svc.repo.find_by_id.return_value = None

    # When / Then
    with pytest.raises(ResourceNotFound) as exc:
        await svc.find_by_id(uuid4())
    assert "não encontrada" in str(exc.value)
```

## Teste de endpoint (TestClient)

```python
# tests/transactions/test_router.py
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_create_transaction_returns_201() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/transactions",
            json={"description": "Almoço", "amount": "45.50"},
        )
    assert response.status_code == 201
    body = response.json()
    assert body["description"] == "Almoço"
```

## Teste de repository (com DB de teste)

```python
# tests/transactions/test_repository.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.transactions.models import Transaction
from app.transactions.repository import TransactionRepository


@pytest.fixture
async def session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as s:
        yield s


@pytest.mark.asyncio
async def test_save_and_retrieve(session: AsyncSession) -> None:
    # Given
    repo = TransactionRepository(session)

    # When
    saved = await repo.save(Transaction(description="x", amount="10.00"))
    await session.commit()

    # Then
    assert saved.id is not None
    found = await repo.find_by_id(saved.id)
    assert found is not None
```

## Parametrize

```python
@pytest.mark.parametrize("amount,expected_status", [
    ("100.00", "APPROVED"),
    ("0.00",   "REJECTED"),
    ("9999.99", "PENDING_REVIEW"),
])
def test_classify(amount: str, expected_status: str) -> None:
    assert classify(Decimal(amount)).status == expected_status
```

## Comandos

```bash
# Rodar todos os testes
pytest

# Verboso + parar no 1º fail
pytest -xvs

# Cobertura
pytest --cov=app --cov-report=term-missing

# Teste específico
pytest tests/transactions/test_service.py::test_find_by_id_raises_when_not_found

# Async sem `@pytest.mark.asyncio` em cada teste — `asyncio_mode = "auto"` no pyproject
```

## Cobertura mínima

| Camada | Cobertura mínima |
|--------|-----------------|
| Service | 90% |
| Router | 80% |
| Repository | 70% (com DB de teste) |
| Schema (Pydantic) | N/A (validação testada via router) |

## Regras invioláveis

- Sem `time.sleep` em teste — usar `asyncio.wait_for` ou polling com timeout
- Sem DB de produção — sempre SQLite in-memory ou Testcontainers
- Cada teste = 1 razão pra falhar
- Nomes de teste descrevem comportamento: `test_create_returns_201_with_valid_body`
- Fixtures pequenas; builders quando setup repete

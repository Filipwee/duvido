# Padrões — Python / FastAPI

🪶 LIDO SOB DEMANDA por Lucas (backend) e Otávio.

> Princípios universais (SOLID, Clean Code) vivem em `rules/wisdom/`.
> Aqui apenas o que é específico de Python/FastAPI.

## Dependency Injection — `Depends`

```python
# ✅ Service recebe sessão de DB via Depends (testável)
class TransactionService:
    def __init__(self, session: AsyncSession = Depends(get_session)) -> None:
        self.repo = TransactionRepository(session)

@router.post("/transactions")
async def create_transaction(
    request: TransactionRequest,
    svc: TransactionService = Depends(),
) -> TransactionResponse:
    return await svc.create(request)
```

## Repository pattern (com SQLAlchemy 2.0 async)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

class TransactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def find_by_id(self, id: UUID) -> Transaction | None:
        result = await self.session.execute(
            select(Transaction).where(Transaction.id == id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: UUID, *, limit: int = 50, offset: int = 0) -> list[Transaction]:
        result = await self.session.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit).offset(offset)
        )
        return list(result.scalars().all())
```

## Schema (DTO) — request/response separados do model

```python
# schemas.py — Pydantic (input/output do mundo HTTP)
class TransactionRequest(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0)

class TransactionResponse(BaseModel):
    id: UUID
    description: str
    amount: Decimal
    created_at: datetime
    model_config = {"from_attributes": True}  # permite carregar de ORM

# models.py — SQLAlchemy (mundo do banco)
class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    description: Mapped[str] = mapped_column(String(200))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))
```

> **Por que separar:** mudança no banco não vaza para o contrato HTTP, e
> vice-versa. Anti-pattern: retornar o model SQLAlchemy direto no endpoint
> (acoplamento que machuca quando o schema do banco evolui).

## Exception → HTTP via handler global

```python
class DomainError(Exception):
    """Base de erros de domínio."""

class ResourceNotFound(DomainError):
    pass

class BusinessRuleViolation(DomainError):
    pass

# main.py
@app.exception_handler(ResourceNotFound)
async def not_found(_: Request, exc: ResourceNotFound) -> JSONResponse:
    return JSONResponse({"code": "NOT_FOUND", "message": str(exc)}, status_code=404)

@app.exception_handler(BusinessRuleViolation)
async def business_rule(_: Request, exc: BusinessRuleViolation) -> JSONResponse:
    return JSONResponse({"code": "BUSINESS_RULE", "message": str(exc)}, status_code=422)
```

## Settings via Pydantic

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    database_url: str
    jwt_secret: str
    jwt_expires_minutes: int = 60

@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
```

## Async context manager para transação

```python
async def create_and_audit(svc: TransactionService, request: TransactionRequest) -> Transaction:
    async with svc.session.begin():       # transação atômica
        tx = await svc.create(request)
        await svc.audit_log.record(tx)
        return tx
    # commit automático; rollback em exceção
```

## Specification / filter pattern (queries dinâmicas)

```python
from sqlalchemy.sql import Select

def by_user(stmt: Select, user_id: UUID | None) -> Select:
    return stmt.where(Transaction.user_id == user_id) if user_id else stmt

def by_status(stmt: Select, status: str | None) -> Select:
    return stmt.where(Transaction.status == status) if status else stmt

# Uso
stmt = select(Transaction)
stmt = by_user(stmt, user_id)
stmt = by_status(stmt, status)
result = await session.execute(stmt)
```

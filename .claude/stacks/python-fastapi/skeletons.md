# Skeletons de Código — Python / FastAPI

🪶 LIDO SOB DEMANDA por Lucas. Padrões obrigatórios.

## Router (endpoints)

```python
# app/transactions/router.py
from fastapi import APIRouter, Depends, status
from uuid import UUID

from app.transactions.schemas import TransactionRequest, TransactionResponse
from app.transactions.service import TransactionService

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TransactionResponse)
async def create(
    request: TransactionRequest,
    svc: TransactionService = Depends(),
) -> TransactionResponse:
    return await svc.create(request)


@router.get("/{id}", response_model=TransactionResponse)
async def get(id: UUID, svc: TransactionService = Depends()) -> TransactionResponse:
    return await svc.find_by_id(id)


@router.get("", response_model=list[TransactionResponse])
async def list_(
    limit: int = 50,
    offset: int = 0,
    svc: TransactionService = Depends(),
) -> list[TransactionResponse]:
    return await svc.list(limit=limit, offset=offset)
```

## Service

```python
# app/transactions/service.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.exceptions import ResourceNotFound
from app.transactions.models import Transaction
from app.transactions.repository import TransactionRepository
from app.transactions.schemas import TransactionRequest, TransactionResponse


class TransactionService:
    def __init__(self, session: AsyncSession = Depends(get_session)) -> None:
        self.session = session
        self.repo = TransactionRepository(session)

    async def create(self, request: TransactionRequest) -> TransactionResponse:
        entity = Transaction(
            description=request.description,
            amount=request.amount,
        )
        async with self.session.begin():
            saved = await self.repo.save(entity)
        return TransactionResponse.model_validate(saved)

    async def find_by_id(self, id: UUID) -> TransactionResponse:
        entity = await self.repo.find_by_id(id)
        if entity is None:
            raise ResourceNotFound(f"transação não encontrada: {id}")
        return TransactionResponse.model_validate(entity)
```

## Repository

```python
# app/transactions/repository.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.transactions.models import Transaction


class TransactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def save(self, entity: Transaction) -> Transaction:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def find_by_id(self, id: UUID) -> Transaction | None:
        result = await self.session.execute(
            select(Transaction).where(Transaction.id == id)
        )
        return result.scalar_one_or_none()
```

## Model (SQLAlchemy 2.0)

```python
# app/transactions/models.py
from datetime import datetime, UTC
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    description: Mapped[str] = mapped_column(String(200))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC), nullable=False
    )
```

## Schema (Pydantic v2)

```python
# app/transactions/schemas.py
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TransactionRequest(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    amount: Decimal = Field(gt=0, decimal_places=2)


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    description: str
    amount: Decimal
    created_at: datetime
```

## Exception hierarchy + handler global

```python
# app/core/exceptions.py
class DomainError(Exception):
    """Base de erros de domínio."""

class ResourceNotFound(DomainError): ...
class BusinessRuleViolation(DomainError): ...
class ConflictError(DomainError): ...

# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="myapp")

@app.exception_handler(ResourceNotFound)
async def not_found(_: Request, exc: ResourceNotFound) -> JSONResponse:
    return JSONResponse({"code": "NOT_FOUND", "message": str(exc)}, status_code=404)

@app.exception_handler(BusinessRuleViolation)
async def business_rule(_: Request, exc: BusinessRuleViolation) -> JSONResponse:
    return JSONResponse({"code": "BUSINESS_RULE", "message": str(exc)}, status_code=422)
```

## Database + dependency

```python
# app/core/database.py
from collections.abc import AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(get_settings().database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
```

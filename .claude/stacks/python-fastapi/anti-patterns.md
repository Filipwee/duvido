# Anti-Patterns — Python / FastAPI

🪶 LIDO SOB DEMANDA. Universais vivem em `rules/wisdom/anti-patterns.md`.

## Mutable default argument

```python
# ❌ Lista compartilhada entre chamadas (bug clássico)
def append_item(item: str, items: list[str] = []) -> list[str]:
    items.append(item)
    return items

# ✅
def append_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items
```

## `float` para dinheiro

```python
# ❌ Imprecisão
amount = 0.1 + 0.2  # → 0.30000000000000004

# ✅ Decimal sempre
from decimal import Decimal
amount = Decimal("0.1") + Decimal("0.2")  # → 0.3
```

## Sync bloqueante dentro de async

```python
# ❌ Trava o event loop inteiro (afeta TODOS os requests)
@router.get("/report")
async def report() -> dict:
    data = heavy_cpu_computation()           # bloqueia
    response = requests.get(url, timeout=5)  # bloqueia (use httpx async)
    return {"data": data}

# ✅ Isola sync em thread; usa lib async para HTTP
@router.get("/report")
async def report() -> dict:
    data = await asyncio.to_thread(heavy_cpu_computation)
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=5)
    return {"data": data}
```

## Retornar model SQLAlchemy do endpoint

```python
# ❌ Acopla HTTP ao schema do banco; problemas de serialização lazy
@router.get("/transactions/{id}")
async def get(id: UUID) -> Transaction:  # model SQLAlchemy direto
    return await repo.find_by_id(id)

# ✅ Schema Pydantic separado
@router.get("/transactions/{id}", response_model=TransactionResponse)
async def get(id: UUID) -> Transaction:
    return await repo.find_by_id(id)  # FastAPI converte via from_attributes
```

## `Any` em type hint público

```python
# ❌ Type hint vira ficção
def process(data: Any) -> Any: ...

# ✅ Tipos concretos ou TypeVar
T = TypeVar("T", bound=BaseModel)
def process(data: T) -> T: ...
```

## Catch genérico que engole exception

```python
# ❌
try:
    risky_op()
except Exception:
    log.error("erro")  # contexto perdido
    pass

# ✅
try:
    risky_op()
except SpecificError as e:
    log.exception("erro em risky_op", extra={"op_id": id})
    raise ServiceError("falha em risky_op") from e
```

## SQL string-concatenado

```python
# ❌ Risco de SQL injection (mesmo em SQLAlchemy textual)
result = await session.execute(text(f"SELECT * FROM users WHERE id = '{user_id}'"))

# ✅ Bind params
result = await session.execute(
    text("SELECT * FROM users WHERE id = :id"), {"id": user_id}
)
# Melhor ainda: usar ORM
result = await session.execute(select(User).where(User.id == user_id))
```

## N+1 com ORM async

```python
# ❌ Cada user dispara query para .transactions
users = await session.execute(select(User))
for user in users.scalars():
    print(len(user.transactions))  # query por user (lazy)

# ✅ selectinload (eager — 1 query extra para todos)
from sqlalchemy.orm import selectinload
users = await session.execute(select(User).options(selectinload(User.transactions)))
```

## `print` em código de produção

```python
# ❌ Sem nível, sem contexto, vai pro stdout
print(f"erro: {e}")

# ✅ logger
log.error("erro processando", extra={"id": id}, exc_info=True)
```

## Reutilizar engine/session globalmente

```python
# ❌ Session compartilhada entre requests — corrupção e race condition
session = AsyncSession(engine)  # módulo-level

# ✅ Sessão por request via Depends
async def get_session() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
```

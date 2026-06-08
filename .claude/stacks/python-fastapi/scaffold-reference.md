# Scaffold Reference — Python / FastAPI / Poetry

🪶 LIDO SOB DEMANDA por Bruno.

## Estrutura padrão

```
<projeto>/
├── pyproject.toml                   ← Poetry + Ruff + mypy + pytest config
├── poetry.lock                      ← travado no repo
├── README.md
├── .gitignore                       ← .venv, __pycache__, .pytest_cache, dist
├── .gitattributes
├── .python-version                  ← se usar pyenv
├── .env.example
├── app/
│   ├── __init__.py
│   ├── main.py                      ← FastAPI app + routers
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                ← Pydantic Settings
│   │   ├── database.py              ← engine + session
│   │   ├── security.py              ← JWT, hashing
│   │   └── exceptions.py
│   ├── transactions/                ← feature
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── users/
│       └── ...
├── tests/
│   ├── conftest.py                  ← fixtures globais
│   └── transactions/
│       ├── test_service.py
│       ├── test_router.py
│       └── test_repository.py
├── alembic/                         ← migrations
│   ├── env.py
│   └── versions/
├── alembic.ini
└── .github/workflows/ci.yml
```

## `pyproject.toml` base

```toml
[tool.poetry]
name = "myapp"
version = "0.1.0"
description = ""
authors = ["Time <time@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.110"
uvicorn = {extras = ["standard"], version = "^0.29"}
pydantic = "^2.6"
pydantic-settings = "^2.2"
sqlalchemy = {extras = ["asyncio"], version = "^2.0"}
asyncpg = "^0.29"           # driver async para Postgres
alembic = "^1.13"
python-jose = {extras = ["cryptography"], version = "^3.3"}   # JWT
passlib = {extras = ["bcrypt"], version = "^1.7"}             # hashing
python-json-logger = "^2.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0"
pytest-asyncio = "^0.23"
pytest-cov = "^5.0"
httpx = "^0.27"
aiosqlite = "^0.20"         # para teste com SQLite
ruff = "^0.4"
mypy = "^1.10"
testcontainers = {extras = ["postgresql"], version = "^4.0"}

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "B", "UP", "ANN", "SIM"]
ignore = ["ANN101", "ANN102"]   # self/cls

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-q --strict-markers"
filterwarnings = ["error"]

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## `.gitignore` base

```
.venv/
__pycache__/
*.pyc
.pytest_cache/
.mypy_cache/
.ruff_cache/
htmlcov/
.coverage
dist/
.env
.env.local
```

## Comandos para Bruno usar

```bash
# Atalho Poetry para criar projeto novo
poetry new --src myapp
cd myapp

# Configurar dependências (mostradas acima) via add
poetry add fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic pydantic pydantic-settings
poetry add --group dev pytest pytest-asyncio pytest-cov httpx ruff mypy aiosqlite

# Alembic init
poetry run alembic init -t async alembic

# Criar estrutura mínima
mkdir -p app/{core,transactions,users}
touch app/__init__.py app/main.py app/core/{__init__.py,config.py,database.py,exceptions.py}
```

## `app/main.py` esqueleto

```python
from fastapi import FastAPI

from app.core.exceptions import register_handlers
from app.transactions.router import router as transactions_router

app = FastAPI(title="myapp", version="0.1.0")
register_handlers(app)
app.include_router(transactions_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

## Multiplataforma

- Encoding UTF-8 default em todos os arquivos (Python 3 cuida)
- `.gitattributes` com `* text=auto eol=lf`
- Windows: `poetry env use python3.12` se múltiplas versões
- Path: usar `pathlib.Path`, não strings concatenadas

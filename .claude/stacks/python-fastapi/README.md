# Stack `python-fastapi`

🪶 Stack para backend Python moderno com FastAPI.

## Linguagem / Framework

- **Linguagem**: Python 3.11+ (3.12 preferido — performance + type hints melhores)
- **Framework**: FastAPI 0.110+ (async-first, OpenAPI gerado automaticamente)
- **Package manager**: Poetry (preferido) ou uv (mais rápido, novo)
- **Test**: pytest 8+ + pytest-asyncio + httpx (TestClient)
- **Lint/Format**: Ruff (formatter + linter unificado)
- **Type checker**: mypy (strict) ou pyright (mais rápido em IDE)
- **ORM**: SQLAlchemy 2.0+ (async) + Alembic (migrations)
- **Validação**: Pydantic v2 (vem com FastAPI)
- **Server**: Uvicorn (dev) / Gunicorn + Uvicorn workers (prod)

## Quando usar

- Backend orientado a I/O (chamadas a APIs, banco), beneficia de async
- API com OpenAPI/Swagger gerado automaticamente como requisito
- Time familiar com Python ou perfil de data/ML que vai expor modelos
- Prototipagem rápida sem sacrificar produção

## Quando NÃO usar (alternativa)

- CPU-bound pesado (cálculo numérico paralelo) → considerar Go ou Java
- Requer máxima performance de runtime estatístico (alta concorrência, baixa latência) → Go ou Java
- Time anti-tipagem ou sem disciplina de mypy → cuidado, é fácil escrever Python mal tipado

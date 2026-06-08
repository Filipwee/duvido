# Build Reference — Python / Poetry|uv / pytest

🪶 LIDO SOB DEMANDA por Max.

## Comandos (Poetry — default do stack)

```bash
# Verificar toolchain
python --version       # >= 3.11
poetry --version

# Instalar dependências
poetry install

# Adicionar dependência (runtime)
poetry add fastapi

# Adicionar dependência (dev)
poetry add --group dev pytest

# Type check
poetry run mypy app

# Lint + format (Ruff cobre os dois)
poetry run ruff check .
poetry run ruff format .

# Testes
poetry run pytest

# Cobertura
poetry run pytest --cov=app --cov-report=term-missing

# Rodar dev server
poetry run uvicorn app.main:app --reload --port 8000

# Build (para distribuição como pacote — raro em app web)
poetry build

# Migrations (Alembic)
poetry run alembic upgrade head
poetry run alembic revision --autogenerate -m "descrição"
```

## Comandos equivalentes com `uv` (alternativa mais rápida)

```bash
uv venv                        # cria .venv
uv pip install -e .            # instala projeto + deps
uv run pytest                  # roda dentro do venv
uv run uvicorn app.main:app --reload
```

## Classificação de erros

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `ModuleNotFoundError: No module named 'X'` | Falta deps ou não instalou no venv | Max (`poetry install`) |
| `ImportError: cannot import name 'X'` | Versão errada ou caminho de import | Lucas |
| `TypeError: missing required positional argument` | Assinatura mudou | Lucas |
| `mypy: error: incompatible types` | Type hint errado | Lucas |
| `ruff: F401 imported but unused` | Import sobrando | Lucas / `ruff --fix` |
| `RuntimeError: There is no current event loop` | Sync em async ou vice-versa | Lucas |
| `pydantic.ValidationError` | Payload errado / schema desalinhado | Lucas |
| `sqlalchemy.exc.NoSuchColumn` | Schema desatualizado | Lucas (criar migration) |
| Test passa mas warning vira erro | `filterwarnings = ["error"]` capturou | Sofia/Lucas |

## CI — exemplo (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - uses: snok/install-poetry@v1
      - run: poetry install --no-interaction
      - run: poetry run ruff check .
      - run: poetry run mypy app
      - run: poetry run pytest --cov=app
```

## Problemas comuns

| Problema | Solução |
|---------|---------|
| `pip` instala global em vez do venv | Ativar venv: `poetry shell` ou `source .venv/bin/activate` |
| Windows: SSL error em `pip install` | Atualizar certificados / configurar proxy |
| Imports relativos quebram | Rodar como módulo: `python -m app.main` ou pacote bem estruturado |
| `asyncio` warning em pytest | `asyncio_mode = "auto"` em pyproject |

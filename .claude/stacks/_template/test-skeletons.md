# Skeletons de Teste — <LINGUAGEM/FRAMEWORK>

🪶 LIDO SOB DEMANDA por Sofia. Skeletons no framework de teste do stack.
Princípios (F.I.R.S.T, GWT) ficam em `rules/wisdom/testing.md`.

## Test framework

- Framework: <ex: pytest, JUnit 5, Vitest, Jest, go test>
- Mocks/stubs: <lib>
- Assertions: <lib>
- Fixtures / builders: <lib ou convenção>

## Teste unitário (maioria)

```<linguagem>
<skeleton GWT>
```

## Teste de integração / slice

```<linguagem>
<skeleton>
```

## Teste de endpoint HTTP / API

```<linguagem>
<skeleton — sem precisar subir DB real se possível>
```

## Test data builders / fixtures

```<linguagem>
<skeleton>
```

## Comandos para rodar

```bash
<comandos>
```

## Cobertura mínima esperada

| Camada | Cobertura mínima |
|--------|-----------------|
| Service / use case | 90% |
| Controller / handler | 80% |
| Repository / gateway | 70% |
| DTO / schema | N/A |

(Ajustar se a comunidade da linguagem tiver convenção diferente.)

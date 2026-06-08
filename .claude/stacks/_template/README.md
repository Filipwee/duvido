# Stack `_template` — Base para criar stacks novos

🪶 **NÃO ATIVAR este stack em `project-profile.md`.** Ele é só molde.

## Como usar

```bash
cp -r .claude/stacks/_template .claude/stacks/<nome-real>
# edita os 7 arquivos
# ativa no project-profile.md
```

## Linguagem / Framework

Preencha aqui (será lido por Sergio em ADR e por Iris no README):

- **Linguagem + versão mínima**: <ex: Python 3.11+>
- **Framework principal (se houver)**: <ex: FastAPI 0.110+>
- **Build/package manager**: <ex: Poetry, uv, pip-tools>
- **Test framework**: <ex: pytest 8+>
- **Lint/format**: <ex: Ruff, Black>
- **Type checker (se aplicável)**: <ex: mypy, pyright>

## Quando usar este stack

(Critérios objetivos: tipo de projeto, ecossistema, restrições de runtime.)

## Quando NÃO usar (apontar alternativa)

(Se a linguagem tem outro stack disponível para outro nicho — ex.: `node-typescript`
para CLI vs `typescript-react` para web — explique aqui.)

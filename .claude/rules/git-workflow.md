# Git Workflow

🪶 CARREGADO EM TODA SESSÃO.

Independente de linguagem. Pequenas particularidades por stack (o que vai no
`.gitignore`) ficam em `stacks/<active>/scaffold-reference.md`.

## Branches

```
main          ← produção — protegida
develop       ← integração
feature/      ← feature/TASK-001-nome-curto
fix/          ← fix/TASK-042-descricao-bug
refactor/     ← refactor/modulo-afetado
```

## Conventional Commits (obrigatório)

```
feat(modulo): adiciona endpoint de criação de transação
fix(auth): corrige validação de JWT expirado
refactor(service): extrai lógica de cálculo para helper
test(controller): adiciona testes de validação de request
docs(readme): atualiza instruções de instalação no Windows
chore(deps): atualiza dependências
```

## Fluxo de trabalho

```
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/TASK-001-nome
4. [implementar]
5. git add .
6. git commit -m "feat(modulo): descrição"
7. git push origin feature/TASK-001-nome
8. Pull Request → develop
```

## O que NUNCA commitar

- Arquivos `.env` ou com credenciais
- Outputs de build (`target/`, `dist/`, `build/`, `bin/`, `__pycache__/`, etc. — conforme stack)
- Arquivos de IDE pessoais (`.idea/workspace.xml`, `.vscode/settings.json` local)
- Binários compilados (`*.class`, `*.jar`, `*.pyc`, `*.o`, `*.exe`)
- Arquivos de sistema Windows (`Thumbs.db`, `Desktop.ini`)
- Arquivos de cache de teste (`.pytest_cache`, `coverage.out`, `htmlcov/`)
- Dependências instaladas localmente (`node_modules/`, `.venv/`, `vendor/`)

A lista exata para o `.gitignore` do stack ativo está em
`stacks/<active>/scaffold-reference.md`.

## Windows: configuração de git recomendada

```bash
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.encoding utf-8
```

`.gitattributes` no repo:
```
* text=auto eol=lf
```

## Commits pequenos e focados

- 1 commit = 1 ideia coesa
- Refactor cosmético separado de mudança de comportamento
- Mensagem do commit explica **por quê**, não só **o quê** (o diff já mostra o quê)

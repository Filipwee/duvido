# Scaffold Reference — <LINGUAGEM/FRAMEWORK>

🪶 LIDO SOB DEMANDA por Bruno (scaffolder). Estrutura e dependências base que
Bruno entrega antes de Lucas/Renata implementarem.

## Estrutura padrão de um projeto novo

```
<árvore de diretórios — não invente, copie do que a comunidade usa>
```

## Arquivos de configuração obrigatórios

(Liste cada um com 1 frase: para que serve. Não cole o conteúdo todo aqui se
for grande — referencie e mostre só os blocos críticos.)

- `<arquivo>` — <propósito>
- ...

## Dependências base (mínimas — não infle)

| Dependência | Versão | Para quê |
|---|---|---|
| <pacote> | <semver> | <razão> |

## Diferenciação: dependências de runtime vs dev/test

(Como cada ecossistema separa isso — `dependencies` vs `devDependencies`,
`scope=provided` vs `scope=test`, `[tool.poetry.group.dev]`, etc.)

## Encoding e line endings (multiplataforma)

- UTF-8 explícito em todos os arquivos
- `.gitattributes` com `* text=auto eol=lf`
- (Mencionar pegadinhas específicas — ex: BOM em PowerShell, encoding em Python no Windows)

## Comandos para Bruno usar

```bash
# Criar estrutura
<comandos mkdir/touch ou o init oficial — ex: `npm init`, `cargo new`, `mvn archetype:generate`, `poetry new`>
```

## Scaffold de subprojeto (se aplicável)

(Ex: scaffold de `frontend/` ao lado de um backend; scaffold de `cli/` ao
lado de uma lib. Só preencher se este stack tipicamente compõe com outros.)

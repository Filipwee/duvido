# Instalação — orq-multilang + Understand-Anything integrado

Sistema de agentes multi-stack (orq-multilang) com plugin de análise de
codebase (Understand-Anything) pré-instalado e integrado.

## Pré-requisitos

| Item | Versão mínima | Por quê |
|------|---------------|---------|
| Claude Code | recente | Executar o orquestrador |
| Git | qualquer | Versionamento e detecção de stack |
| Node.js | 20+ LTS | Pipeline do plugin Understand-Anything |
| pnpm | 8+ | Build do plugin (`npm i -g pnpm`) |
| Python | 3.10+ | Scripts internos do pipeline UA |

Toolchains do **stack** que você vai usar (Java/Maven, Python/Poetry,
Go, etc.) são detectadas no `SessionStart` do orquestrador.

## Instalação

1. Descompacte o zip no diretório do projeto (ou em pasta vazia se for projeto novo):

```bash
unzip orq-multilang.zip
cd orq-multilang
```

2. Abra com Claude Code (o orquestrador inicia automaticamente via `CLAUDE.md`).

3. **Para projeto novo:** descreva o projeto e use `/start-project <descrição>`.
   Viktor conduz Discovery, define o stack ativo, e arranca o walking skeleton.

4. **Para projeto existente:** copie todo o conteúdo de `orq-multilang/` para a
   raiz do seu projeto, ajuste `.claude/project-profile.md` com seu stack, e
   use `/explore-codebase` para gerar o mapa inicial.

## Primeira execução do plugin Understand-Anything

Na primeira vez que `/understand` (ou `/explore-codebase`) for chamado, o plugin
precisa fazer build do código TypeScript em
`.claude/plugins/understand-anything/`. Yara cuida disso automaticamente:

```bash
cd .claude/plugins/understand-anything
pnpm install
pnpm build
```

Se algo falhar, rode esses comandos manualmente.

## Estrutura geral

```
orq-multilang/
├── CLAUDE.md                              ← carregado em toda sessão
├── INSTALL.md                             ← este arquivo
├── REFACTOR-NOTES.md                      ← histórico da refatoração multi-stack
├── .gitignore
└── .claude/
    ├── project-profile.md                 ← stack ativo (configurar!)
    ├── settings.json                      ← permissões + hooks
    ├── CLAUDE-CODE-CHEATSHEET.md
    ├── MCP-SERVERS.md
    ├── agents/                            ← 16 agentes (15 originais + Yara)
    ├── skills/                            ← 14 skills (13 originais + /explore-codebase)
    ├── stacks/                            ← java-spring, python-fastapi, node-typescript, typescript-react, go, _template
    ├── plugins/                           ← plugins externos
    │   ├── README.md                      ← como integrar plugins
    │   ├── understand-anything/           ← plugin UA (v2.7.5) — agents/skills/src/packages
    │   └── understand-anything-docs/      ← docs originais do plugin
    ├── rules/
    │   ├── coding-standards.md            ← universal
    │   ├── git-workflow.md                ← universal
    │   ├── wisdom/                        ← solid, clean-code, error-handling, testing, etc.
    │   └── templates/                     ← ADR, threat model, design spec, etc.
    ├── protocols/                         ← ceremonies, communication, time-budget, vetoes
    ├── hooks/                             ← session-start (detecta plugins + stacks), post-write-format, firewall
    ├── git-hooks/                         ← pre-commit, commit-msg
    ├── state/                             ← dashboard, current-plan, logs
    ├── memory/                            ← decisions, glossary
    └── context/                           ← architecture.md, adr/, briefs/, design/, etc.
```

## Verificação

Abra um terminal no diretório e rode:

```bash
node --version              # >= 20
pnpm --version              # >= 8
python3 --version           # >= 3.10
ls .claude/plugins/         # deve listar understand-anything, understand-anything-docs, README.md
ls .claude/agents/ | wc -l  # 16
```

Inicie uma sessão Claude Code — Viktor (orchestrator) é o primeiro a falar e
mostra status + plugins detectados.

## Comandos principais

**Skills do orq:**
- `/start-project <desc>` — criar projeto novo (Discovery → walking skeleton → loop)
- `/explore-codebase <desc>` — mapear codebase existente (aciona Yara + plugin UA)
- `/build-frontend <desc>`, `/diagnose-bug`, `/refactor-code`, `/run-build`, etc.

**Skills do plugin UA (Yara também pode chamar):**
- `/understand` — pipeline completo (escanear + gerar grafo)
- `/understand-dashboard` — abrir dashboard web do grafo
- `/understand-chat` — Q&A sobre o código
- `/understand-diff`, `/understand-explain`, `/understand-domain`, `/understand-onboard`, `/understand-knowledge`

Ver `.claude/CLAUDE-CODE-CHEATSHEET.md` para a lista completa.

## Atualizar o plugin Understand-Anything

O plugin está em `.claude/plugins/understand-anything/` (versão 2.7.5
empacotada). Para atualizar:

1. Baixar nova versão de https://github.com/Lum1104/Understand-Anything
2. Substituir o diretório `.claude/plugins/understand-anything/` pelo
   `understand-anything-plugin/` da nova versão
3. Manter os agentes (`codebase-explorer.md`) e skills (`/explore-codebase`)
   do orq inalterados — eles são camada de integração estável
4. Rebuild: `cd .claude/plugins/understand-anything && pnpm install && pnpm build`

## Solução de problemas

| Sintoma | Diagnóstico |
|---------|-------------|
| `pnpm: command not found` | Instalar: `npm install -g pnpm` |
| `Cannot find module '@understand-anything/core'` | Rodar `pnpm install && pnpm build` em `.claude/plugins/understand-anything/` |
| Plugin não aparece em `SessionStart` | Verificar `ls .claude/plugins/` e `.claude/plugins/understand-anything/.claude-plugin/plugin.json` |
| Grafo desatualizado / stale | `/understand --auto-update` (incremental) ou `/understand --full` (rebuild completo) |
| `/understand` muito lento | Codebase grande — usar `.understandignore`, ou analisar um subdir: `/understand path/to/sub` |

## Licenças

- **orq-multilang** — refatoração multi-stack baseada em sistema próprio
- **Understand-Anything** — MIT, Copyright (c) Lum1104. Veja `.claude/plugins/understand-anything-docs/LICENSE`

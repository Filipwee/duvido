# orq-multilang — Notas da Refatoração

Versão multi-stack do sistema **orq** original. Estrutura agora é **agnóstica
de linguagem** — o projeto pode ser em Java, Python, TypeScript, Go, etc.,
e os 15 agentes operam com profundidade equivalente em qualquer um.

## O que mudou em relação ao orq original

### Adicionado
- `.claude/project-profile.md` — fonte de verdade do stack ativo (YAML carregado em toda sessão).
- `.claude/stacks/` — 5 adaptadores prontos + `_template` para criar novos:
  - `java-spring` — Java 17+ / Spring Boot 3.x / Maven (reaproveita o conteúdo original)
  - `typescript-react` — TS / React 18 / Vite (reaproveita o conteúdo original)
  - `python-fastapi` — Python 3.11+ / FastAPI / Poetry / pytest **(novo)**
  - `node-typescript` — Node 20+ / Fastify / Vitest **(novo)**
  - `go` — Go 1.22+ / chi / go test **(novo)**
  - `_template` — placeholders para criar stack novo (Rust, C#, Ruby, etc.)

Cada stack tem 8 arquivos com nomes fixos:
`README.md`, `language-rules.md`, `patterns.md`, `anti-patterns.md`,
`skeletons.md`, `test-skeletons.md`, `build-reference.md`, `scaffold-reference.md`.

### Reescrito (agora universal/agnóstico)
- **Agentes técnicos** (Lucas, Renata, Bruno, Max, Sofia, Otávio) — lêem
  o stack ativo sob demanda em vez de assumir Java/React.
- **Agentes de coordenação** (Viktor, Sergio, Petra, Nina, Téo) — refs
  hardcoded a Java/Maven trocadas por "stack ativo".
- **Wisdom** (`rules/wisdom/`): `solid.md`, `clean-code.md`, `anti-patterns.md`,
  `error-handling.md`, `testing.md`, `definition-of-done.md` — agora universais
  com exemplos multi-linguagem.
- **Regras gerais** (`rules/coding-standards.md`, `rules/git-workflow.md`) —
  sem hardcoded.
- **Skills**: `start-project` (substitui `start-java-project`), `run-build`,
  `generate-tests`, `build-frontend`, `review-code`, `refactor-code`,
  `diagnose-bug`, `optimize-performance`, `threat-model` — todas agnósticas.

### Atualizado
- **Hooks**:
  - `session-start.sh` — detecta toolchains de vários ecossistemas (java, mvn,
    gradle, node, npm, pnpm, python, poetry, uv, pytest, go, cargo, dotnet, etc.)
    e lê stacks ativos do `project-profile.md`.
  - `post-write-format.sh` — formata por extensão de arquivo (Ruff p/ Python,
    Prettier p/ TS/JS, gofmt p/ Go, google-java-format p/ Java, rustfmt p/ Rust).
  - `pre-bash-firewall.sh` — alerta para operações de publish/deploy em
    qualquer ecossistema (mvn deploy, npm publish, poetry publish, cargo publish,
    docker push, etc.).
- **`settings.json`** — permissões expandidas para todos os principais
  toolchains. `Edit` bloqueado para manifesto de cada ecossistema (pom.xml,
  package.json, pyproject.toml, go.mod, Cargo.toml).
- **`MCP-SERVERS.md`** — título e descrição genéricos.

### Resetado para template
- `.claude/state/dashboard.md`, `current-plan.md` — eram histórico de feature
  específica do projeto antigo (login JWT em Java).
- `.claude/context/architecture.md` — idem.
- `.claude/state/{bash,feedback,handoff,lateral}-log.md` — vazios.
- `.claude/memory/{decisions,glossary}.md` — vazios.
- `.claude/context/adr/ADR-001-*`, `briefs/PB-001-*`, `security/TM-001-*` —
  removidos (eram exemplos do projeto antigo).

## Como usar

1. **Para projeto novo**: edite `.claude/project-profile.md` declarando o
   `active_stacks`. Use `/start-project <descrição>` no Claude Code.
2. **Para projeto existente em outra linguagem**: copie a pasta do stack
   apropriado (ou crie a partir de `_template/`) e ajuste o `project-profile.md`.
3. **Para adicionar novo stack**: copie `.claude/stacks/_template/` para
   `.claude/stacks/<nome>/` e preencha os 8 arquivos. Os agentes detectam
   automaticamente via `project-profile.md` — nenhuma persona precisa mudar.

## Preservado integralmente

- Os 15 agentes (Viktor, Sergio, Olivia, Helena, Petra, Bruno, Lucas, Renata,
  Diana, Sofia, Otávio, Nina, Max, Téo, Iris).
- Hierarquia de vetos (Nina > Olivia > Sergio > Helena > Iris > Otávio;
  Viktor tie-breaker).
- Protocolo 3-strike de escalação.
- Cerimônias (Discovery, Refinement, Walking Skeleton, Retro, Postmortem).
- Diálogo lateral entre pares aprovados.
- Modos `prototype`/`production` e `lean`/`medium`/`full`.

---

# Integração — Understand-Anything (v2.7.5)

Adicionada uma segunda camada: análise de **codebases existentes** via plugin
externo, integrado nativamente ao orquestrador.

## O que foi adicionado

### Plugin instalado
- `.claude/plugins/understand-anything/` — código completo do plugin UA (agents,
  skills, src TypeScript, packages, hooks, manifesto)
- `.claude/plugins/understand-anything-docs/` — docs originais (README, LICENSE,
  install scripts)
- `.claude/plugins/README.md` — guia de como integrar plugins futuros

### Agente novo
- **Yara (`codebase-explorer`)** — "Cartógrafa do código". Persona Senior Staff
  Engineer especialista em arqueologia de software. Opera o plugin sob comando
  de Viktor; entrega mapas, não decisões. Time agora tem **16 agentes** (era 15).

### Skill nova
- **`/explore-codebase`** — entrada padronizada do orquestrador. Aciona Yara
  que opera o plugin. Para projetos EXISTENTES (diferente de `/start-project`,
  que cria projetos NOVOS).

### Integrações em agentes existentes
- **Iris (context)** — pode pedir grafo a Yara para atualizar `architecture.md`.
- **Sergio (architect)** — pede grafo a Yara antes de ADR sobre mudança estrutural.
- **Otávio (reviewer)** — pede `/understand-diff` a Yara antes de aprovar PR grande.
- **Viktor (orchestrator)** — tabela de delegação ganhou 7 linhas sobre cenários
  Yara; seção dedicada "Como detectar pedido para Yara" adicionada.

### Hooks
- `SessionStart` do orq foi mantido + **hook do plugin** adicionado (alerta
  quando grafo está stale após git checkout).
- `PostToolUse` no Bash mantém o log do orq + **hook do plugin** adicionado
  (alerta auto-update quando há commit/merge/rebase com `autoUpdate: true`).
- `session-start.sh` agora **detecta plugins instalados** e **mostra estado do
  grafo** (sincronizado/stale/ausente) no banner.

### Permissões em `settings.json`
- `Bash(node *.mjs:*)`, `Bash(python merge-batch-graphs.py:*)` e variantes para
  o pipeline interno do plugin.
- `Bash(pnpm:*)`, `Bash(tsc:*)` para o build do plugin.
- `Write/Edit/Read(.understand-anything/**)` — output do plugin no projeto alvo.
- `Read(.claude/plugins/**)` — acesso ao plugin instalado.

### `.gitignore`
Adicionadas regras para:
- Commitar: `knowledge-graph.json`, `config.json`, `meta.json`
- Ignorar: `intermediate/`, `diff-overlay.json`, builds, `node_modules/`

### Documentação atualizada
- `CLAUDE.md` — nova seção "Plugins instalados"; Yara na tabela do time (16 agentes)
- `CLAUDE-CODE-CHEATSHEET.md` — nova seção "Skills do plugin Understand-Anything"; Yara na tabela
- `INSTALL.md` — instruções completas de pré-requisitos, primeiro uso, atualização do plugin

## Princípio da integração

O plugin **não foi adaptado** — ficou intacto em `.claude/plugins/understand-anything/`
exatamente como veio do upstream (v2.7.5). A **camada de integração** é
externa:

```
.claude/agents/codebase-explorer.md  (Yara — sabe quando/por que usar)
.claude/skills/explore-codebase/     (skill wrapper do orq)
.claude/plugins/understand-anything/ (plugin original, intocado)
```

Isso permite atualizar o plugin (substituir a pasta) sem mexer na integração,
e remover o plugin sem quebrar o orquestrador.

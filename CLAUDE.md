# Sistema Orquestrado de Agentes — Multi-Stack (v2)

## Regra de ouro
TODA demanda começa acionando o subagent `orchestrator` (Viktor).
Você descreve o problema, Viktor decide quem chamar.

## 🪶 Orçamento de contexto

Arquivos marcados com `@` aqui no CLAUDE.md são **carregados em toda sessão**.
Cada arquivo custa contexto. A lista atual é enxuta de propósito.

**Personas dos agentes NÃO são carregadas aqui** — só quando Viktor aciona
o agente específico. Isso economiza milhares de tokens por sessão.

**Regras de stack NÃO são carregadas aqui** — agentes técnicos lêem o stack
ativo sob demanda. Ver `.claude/stacks/README.md`.

Se adicionar import novo (`@...`), considere se justifica o custo permanente.

## Imports automáticos (essenciais — universais)
@.claude/project-profile.md
@.claude/rules/coding-standards.md
@.claude/rules/git-workflow.md
@.claude/protocols/communication.md
@.claude/protocols/time-budget.md

## Stack do projeto (configuração)

Este sistema é **multi-linguagem**. O stack concreto do projeto fica em
`.claude/project-profile.md` (carregado acima). Ele aponta para um ou mais
stacks plugáveis em `.claude/stacks/<nome>/`.

**Stacks de referência inclusos** (cada um com `language-rules.md`,
`patterns.md`, `anti-patterns.md`, `skeletons.md`, `test-skeletons.md`,
`build-reference.md`, `scaffold-reference.md`):

- `java-spring` — Java 17+ / Spring Boot 3.x / Maven / JUnit
- `typescript-react` — TypeScript / React 18+ / Vite / Vitest (SPA)
- `nextjs` — TypeScript / Next.js 15+ (App Router) / React 19+ / Vitest + Playwright (full-stack web)
- `python-fastapi` — Python 3.11+ / FastAPI / Poetry|uv / pytest
- `node-typescript` — Node 20+ / Express|Fastify / TypeScript / Jest|Vitest
- `go` — Go 1.22+ / stdlib net/http / go test

**Adicionar um stack novo** (qualquer linguagem): copie `.claude/stacks/_template/`
para `.claude/stacks/<nova-linguagem>/` e preencha os 8 arquivos. Os agentes
detectam automaticamente o stack ativo via `project-profile.md` — nenhuma
mudança em persona é necessária.

**Se NÃO existe stack para a linguagem do projeto**, os agentes ainda funcionam
operando só com os princípios universais (`rules/wisdom/`), mas com profundidade
menor — Viktor sinaliza isso e pode pedir ao usuário para gerar o stack.

## Wisdom universal (lido sob demanda pelos agentes, não global)
Localização: `.claude/rules/wisdom/` — válido para qualquer linguagem.

- `solid.md` — princípios SOLID com exemplos genéricos
- `clean-code.md` — nomes, funções, comentários, Demeter
- `error-handling.md` — estratégias de erro independentes de linguagem
- `testing.md` — F.I.R.S.T, Given-When-Then, dublês de teste
- `anti-patterns.md` — God Class, N+1, Magic String, Transaction Too Long
- `definition-of-done.md` — checklist completo por tipo de entrega

Padrões específicos de linguagem (ex: padrões Spring, padrões React) vivem
no respectivo stack em `.claude/stacks/<nome>/patterns.md`.

## Templates (lidos sob demanda — universais)
Localização: `.claude/rules/templates/`

Formatos de saída (artefatos universais — não acoplados a linguagem):
- `adr-template.md` — Architecture Decision Record (Sergio)
- `threat-model-template.md` — Threat Model STRIDE + TM curto (Nina)
- `design-spec-template.md` — Design Spec + spec curta (Helena)
- `product-brief-template.md` — Product Brief + brief curto (Olivia)
- `integration-report-template.md` — Relatório de Integração 10 seções (Diana)

## Plugins instalados

### `understand-anything` — Análise de codebase via grafo de conhecimento

Localização: `.claude/plugins/understand-anything/`.

Plugin externo (de Lum1104/Understand-Anything, MIT) que analisa codebases
existentes e gera grafo de conhecimento navegável. Integrado ao orquestrador
via:

- **Agente `codebase-explorer` (Yara)** em `.claude/agents/codebase-explorer.md`
  — opera o plugin sob comando de Viktor.
- **Skill `/explore-codebase`** em `.claude/skills/explore-codebase/SKILL.md`
  — entrada padronizada via fluxo do orquestrador.

Comandos do plugin (acessíveis via Yara):
- `/understand` — escaneia projeto, gera grafo em `.understand-anything/knowledge-graph.json`
- `/understand-chat` — Q&A sobre o código usando o grafo
- `/understand-dashboard` — abre dashboard web interativo
- `/understand-diff` — análise de impacto de PR/diff
- `/understand-explain <alvo>` — deep-dive em arquivo/função/módulo
- `/understand-domain` — extrai fluxos de domínio de negócio
- `/understand-onboard` — gera guia de onboarding a partir do grafo
- `/understand-knowledge` — analisa wikis Karpathy-pattern (knowledge bases)

Use quando: onboarding em codebase desconhecida, análise pré-refactor,
mapeamento de impacto de PR, visão sistêmica antes de ADR, postmortem.
Ver `.claude/agents/codebase-explorer.md` para detalhes.

> **Importante:** `/start-project` (skill do orq) cria projeto NOVO; 
> `/explore-codebase` (skill do orq, aciona Yara) MAPEIA projeto EXISTENTE.
> São complementares, não conflitantes.

---

Skeletons de código, comandos de build/test e scaffolds **moveram-se para os
stacks**, pois variam por linguagem:
- `stacks/<nome>/skeletons.md` — Bruno, Lucas (skeletons backend) ou Renata (frontend)
- `stacks/<nome>/test-skeletons.md` — Sofia
- `stacks/<nome>/build-reference.md` — Max
- `stacks/<nome>/scaffold-reference.md` — Bruno

## Convenções comuns aos agentes
`.claude/protocols/agent-conventions.md` — auto-feedback, "👉 próximo passo prático",
formato de handoff e escalação 3-strike, num só lugar. Cada agente aponta para cá
em vez de repetir o bloco. Lido sob demanda.

## Estado e memória
- Painel: `.claude/state/dashboard.md` (Viktor lê no ritual de abertura)
- Plano: `.claude/state/current-plan.md`
- Memória: `.claude/memory/` (consultada por Viktor sob demanda)

## Camadas de proteção (5)
1. Personas (`.claude/agents/*.md`)
2. Skills (`.claude/skills/*/SKILL.md`)
3. Permissions (`.claude/settings.json`)
4. Hooks Claude Code (`.claude/hooks/scripts/`)
5. Git hooks (`.claude/git-hooks/` — para `git commit` direto)

## Time atual (16 agentes — agnósticos de linguagem)

**Coordenação e decisão**
- Viktor (orchestrator) — **Engineering Manager**: coordena, prazo, escalação, dashboard, cerimônias. Não decide técnica/produto/UX/segurança.
- Sergio (architect) — **Tech Lead + Architect**: autoridade técnica, ADRs, padrão. Veto técnico.
- Olivia (product-manager) — **PM**: brief, critério de aceite, métrica. Veto de produto.

**Design e implementação**
- Helena (designer) — **UX/UI**: design spec, fluxo, a11y. Veto de design.
- Petra (planner) — decomposição em tasks atômicas.
- Bruno (scaffolder) — estrutura e scaffold (carrega o stack ativo para gerar a estrutura correta).
- Lucas (coder) — engenharia de backend (carrega o stack backend ativo).
- Renata (frontend) — engenharia de frontend (carrega o stack frontend ativo).
- Diana (integrator) — integrações externas (APIs, webhooks, OAuth, scraping).

**Qualidade e operação**
- Sofia (tester) — testes (carrega o stack ativo para usar o framework de teste correto).
- Otávio (reviewer) — code review (carrega o stack ativo). Veto de review.
- Nina (security) — **Security Engineer**: threat model STRIDE, LGPD/GDPR. Veto de segurança (o mais forte).
- Max (build) — **Build + DevOps light**: build tool do stack, CI, hooks (código → artefato).
- Téo (sre) — **Site Reliability Engineer**: deploy/CD, observabilidade, incidente, rollback, SLO (artefato → produção). Veto de prontidão de deploy.
- Iris (context) — **Tech Writer**: README, CHANGELOG, índice de ADRs/Briefs/Design/TMs. Veto de docs.

**Análise de codebase existente**
- Yara (codebase-explorer) — **Cartógrafa do código**: opera o plugin `understand-anything` em `.claude/plugins/`. Mapeia codebases existentes via grafo de conhecimento; impact analysis de PRs; onboarding; fornece dados visuais para Sergio (ADRs), Iris (docs) e Otávio (reviews).

Todos carregados SOB DEMANDA quando Viktor os aciona (Sergio e pares aprovados também acionam lateralmente).

## Hierarquia, vetos e cerimônias
- **Hierarquia**: Viktor (EM) coordena; Sergio (TL) é autoridade técnica; Olivia/Helena/Nina decidem produto/design/segurança.
- **Vetos cruzados** (`.claude/protocols/vetoes.md`): prioridade Nina > Olivia > Sergio > Helena > Iris > Otávio. Viktor é tie-breaker.
- **Diálogo lateral** (`.claude/protocols/lateral-dialog.md`): pares aprovados conversam direto; Viktor é notificado, não consultado.
- **Cerimônias** (`.claude/protocols/ceremonies.md`): Discovery, Refinement, Walking Skeleton, Retro, Postmortem — disparam por evento.

## Comandos úteis (multiplataforma — não tocam o contexto)

```
# Windows
.claude\git-hooks\install.bat
.claude\state\metrics\team-metrics.bat

# Unix-like (Linux/macOS)
bash .claude/git-hooks/install.sh
bash .claude/state/metrics/team-metrics.sh
```

## Modo verboso do Viktor
Diga `modo verboso` para que Viktor narre o pensamento antes de delegar.
Útil para debug e calibração. Caro em tokens — use quando precisa.

## Referência rápida
@.claude/MCP-SERVERS.md
@.claude/CLAUDE-CODE-CHEATSHEET.md

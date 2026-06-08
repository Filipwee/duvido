# Claude Code — Cheatsheet Multi-Stack

> Sistema agnóstico de linguagem. O **stack ativo** vem de `.claude/project-profile.md`.

## Comandos de sessão

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `/clear` | Limpa contexto | Trocando de feature |
| `/compact` | Resume conversa | Sessão longa |
| `/recap` | Resumo da sessão | Voltando depois de pausa |
| `/context` | Mostra uso de contexto | Antes de tarefa pesada |

## Comandos de configuração

| Comando | O que faz |
|---------|-----------|
| `/help` | Lista todos comandos |
| `/hooks` | Lista hooks configurados |
| `/doctor` | Diagnóstico do setup |
| `/permissions` | Vê e ajusta permissões |

## Modelo e raciocínio

| Comando | Quando usar |
|---------|------------|
| `/effort high` | Decisão arquitetural, refactor grande |
| `/model claude-opus-4-7` | Análise complexa de domínio |

## Skills deste projeto

| Comando | O que faz |
|---------|-----------|
| `/start-project` | Cria projeto do zero em qualquer stack (Discovery → sketch → walking skeleton → loop) |
| `/build-frontend` | Cria ou estende UI no stack frontend ativo (Renata + Sofia + Max + Otávio) |
| `/review-code` | Revisão de código (Otávio + Sofia) |
| `/run-build` | Executa build no tooling do stack ativo + loop de correção (Max + Lucas) |
| `/generate-tests` | Gera testes no framework do stack (Sofia + Max) |
| `/update-context` | Sincroniza docs externas e índices (Iris) |
| `/audit-integration` | Auditoria técnica de integração com sistema externo (Diana → relatório 10 seções) |
| `/product-brief` | Traduz pedido vago em requisito verificável (Olivia → brief com critério GWT) |
| `/threat-model` | Modelagem de ameaças STRIDE de feature sensível (Nina → mitigações + veto) |
| `/refactor-code` | Refatora preservando comportamento (Sofia rede de testes → Lucas/Renata → Max → Otávio) |
| `/optimize-performance` | Diagnóstico e otimização com baseline medido |
| `/diagnose-bug` | Bug até a causa raiz com teste de regressão |
| `/deploy` | Leva artefato a produção com prontidão operacional (Téo) |

## Skills do plugin Understand-Anything

Acionadas via agente Yara (`codebase-explorer`) ou diretamente. Operam sobre
codebases EXISTENTES (`/start-project` é para criar projetos novos).

| Comando | O que faz |
|---------|-----------|
| `/explore-codebase` | Entrada padronizada do orquestrador — Viktor aciona Yara que opera o plugin |
| `/understand` | Pipeline completo: escaneia projeto + gera grafo em `.understand-anything/knowledge-graph.json` |
| `/understand-chat` | Q&A sobre o código usando o grafo |
| `/understand-dashboard` | Abre o dashboard web interativo (pan, zoom, busca, tours) |
| `/understand-diff` | Análise de impacto de PR/git diff — quem é afetado |
| `/understand-explain <alvo>` | Deep-dive em arquivo/função/módulo específico |
| `/understand-domain` | Extrai fluxos de domínio de negócio do código |
| `/understand-onboard` | Gera guia de onboarding a partir do grafo |
| `/understand-knowledge <wiki>` | Analisa wiki Karpathy-pattern (knowledge base, não código) |

Flags úteis:
- `--language pt-BR` (ou `zh`, `ja`, `en`, etc.) — gera summaries no idioma escolhido
- `--full` — força rebuild completo (descarta grafo existente)
- `--auto-update` — ativa hook post-commit para manter grafo sincronizado
- `--no-auto-update` — desliga

Output: `.understand-anything/knowledge-graph.json` é o arquivo central
(JSON commitável). `intermediate/` e `diff-overlay.json` são locais (não
commitar).

## Fluxos recomendados

### "Quero criar um projeto novo (qualquer linguagem)"
```
/clear
/start-project API REST de gerenciamento financeiro
```
Viktor conduz Discovery, define o stack com você, e inicia o walking skeleton
no stack escolhido (java-spring, python-fastapi, node-typescript, go, etc.).

### "Quero revisar o código antes de commitar"
```
/review-code
```

### "Build quebrou"
```
/run-build
```

### "Sessão longa, vou continuar amanhã"
```
/update-context
/compact
# amanhã:
claude
/recap
```

### "Quero implementar uma nova feature"
```
"Viktor, implemente o endpoint de criação de transação com validação e testes"
```

### "Quero criar a tela de listagem de transações"
```
/build-frontend listagem de transações com filtro por status e paginação
# (Olivia faz brief se vago → Helena faz design spec → Renata implementa)
```

### "Quero iniciar o frontend do zero"
```
/build-frontend scaffold inicial do frontend
```

### "Tenho um pedido vago e quero clareza antes de planejar"
```
/product-brief acompanhar gastos por categoria com gráfico
```

### "Vou mexer em login / dados sensíveis"
```
/threat-model login com JWT e refresh token
```

## Modo verboso

Para ver o raciocínio do Viktor: `modo verboso` | desativar: `modo normal`.

## Toolchain — dicas multiplataforma

| Problema | Solução |
|---------|---------|
| Toolchain do stack não encontrada | Verificar PATH; cada `stacks/<active>/build-reference.md` lista comandos esperados |
| Encoding errado em Java | `set JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8` |
| Git hooks não executam (Windows) | Verificar se Git Bash está no PATH ou usar WSL |
| LF vs CRLF | `.gitattributes` resolve — rodar `install.bat` ou `chmod +x` dos hooks |
| Porta de dev ocupada | Verificar processo no PATH; comando varia por OS |
| `npm install` lento | Considerar `pnpm`. Em Python, considerar `uv` em vez de pip |

## Diagnóstico quando algo der errado

```
/doctor                    # checagem geral
/hooks                     # lista hooks e status
/context                   # uso de contexto
Ctrl+O                     # verbose mode (vê stdout/stderr de hooks)
```

## Time completo

| Agente | Nome | Especialidade |
|--------|------|--------------|
| orchestrator | Viktor | **Engineering Manager** — coordenação, prazo, escalação, dashboard, cerimônias (tie-breaker de veto) |
| architect | Sergio | **Tech Lead + Architect** — autoridade técnica, ADRs, escolha de padrão (veto técnico) |
| product-manager | Olivia | **Product Manager** — brief, critério de aceite GWT, métrica (veto de produto) |
| designer | Helena | **UX/UI Designer** — design spec, fluxo, wireframe, a11y (veto de design) |
| planner | Petra | Decomposição e planejamento |
| scaffolder | Bruno | Estrutura e scaffold no stack ativo |
| coder | Lucas | Implementação backend no stack ativo (Java/Python/Node/Go/...) |
| frontend | Renata | UI no stack frontend ativo (React/Vue/Svelte/...) + integração REST |
| tester | Sofia | Testes no framework do stack ativo (JUnit, pytest, Vitest, go test, ...) |
| reviewer | Otávio | Code review e qualidade (no stack ativo) — veto de review |
| security | Nina | **Security Engineer** — threat model STRIDE, OWASP, LGPD (veto de segurança) |
| build | Max | **Build + DevOps light** — build tool do stack, CI, hooks, gates |
| sre | Téo | **Site Reliability Engineer** — deploy/CD, observabilidade, incidente, rollback, SLO |
| context | Iris | **Tech Writer** — README, CHANGELOG, glossário, índice de ADRs/Briefs/Design/TMs (veto de docs) |
| integrator | Diana | Auditoria e arquitetura de integrações externas |
| codebase-explorer | Yara | **Cartógrafa do código** — opera o plugin Understand-Anything; mapas, grafos, impact analysis, onboarding de codebase existente |

## Stacks de referência inclusos

| Stack | Linguagem / Framework |
|-------|----------------------|
| `java-spring` | Java 17+ / Spring Boot 3.x / Maven |
| `python-fastapi` | Python 3.11+ / FastAPI / Poetry / pytest |
| `node-typescript` | Node 20+ / Fastify (ou Express) / Vitest |
| `typescript-react` | React 18+ / TypeScript / Vite |
| `go` | Go 1.22+ / net/http + chi / go test |
| `_template` | Para criar um stack novo (Rust, C#, Ruby, etc.) |

Cada stack vive em `.claude/stacks/<nome>/` com 8 arquivos (README,
language-rules, patterns, anti-patterns, skeletons, test-skeletons,
build-reference, scaffold-reference). Ver `.claude/stacks/README.md`.

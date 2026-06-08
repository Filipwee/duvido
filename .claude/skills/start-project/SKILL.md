---
name: start-project
description: Inicia um projeto novo do zero com fluxo iterativo realista — Discovery, sketch arquitetural, walking skeleton e iteração por feature, no STACK ATIVO do projeto. Use quando o usuário pede para criar um novo projeto em qualquer linguagem (Spring Boot, FastAPI, Express, Go, etc.). Aciona Olivia → Sergio → walking skeleton (Bruno+Lucas+Sofia+Max) → loop por feature.
---

# Start Project

Você está iniciando um projeto **novo**. O fluxo é **iterativo**, não cascata.
Em time real, ninguém planeja 50 tasks antes de tocar código — entrega-se um
esqueleto funcional em dias e refina-se em ciclos curtos.

A **linguagem e o stack** vêm do `.claude/project-profile.md` — Viktor decide
com o usuário durante o Discovery, ou auto-detecta se já há código.

## Princípio do fluxo

```
FASE 0 — Discovery        (entender o problema + definir stack)
FASE 1 — Sketch           (arquitetura de alto nível, NÃO ADR completo)
FASE 2 — Walking Skeleton (end-to-end mínimo rodando, 1-3 dias)
FASE 3 — Iteração         (loop por feature — slice vertical)
FASE 4 — Consolidação     (ADRs formais, dívida, retro)
```

Não pule fases. Mas cada fase é **leve** — não vire waterfall disfarçado.

## Argumento esperado
Descrição do projeto (pode ser vaga). Passada via $ARGUMENTS.

---

## FASE 0 — Discovery (cerimônia)

Conduzida por Viktor. Ver `.claude/protocols/ceremonies.md` → Discovery.

Participantes: **Olivia** (lead), **Sergio**, **Viktor**.

1. **Olivia** reformula "$ARGUMENTS" na voz do **problema**, não da solução
2. **Olivia** identifica persona, frequência de uso, "pior dia"
3. **Sergio** levanta restrições técnicas óbvias (escala esperada, integrações, time, ecossistema preferido)
4. **Sergio + Viktor + Usuário** definem **stack ativo**:
   - Se o usuário tem preferência clara (ex. "queremos em Go"), respeitamos
   - Se não, Sergio propõe baseado no domínio:
     - Sistema transacional corporativo, time enterprise → `java-spring`
     - API rica com domínio robusto, time Python → `python-fastapi`
     - API leve, edge/serverless, time JS → `node-typescript`
     - Worker/CLI/sidecar/alta concorrência → `go`
     - UI rica para a stack — adicionar `typescript-react` se full-stack
   - Decisão registrada em `.claude/project-profile.md` (`active_stacks`)
5. Todos: riscos iniciais (produto, técnico, prazo)
6. **Viktor** decide: tem clareza pra seguir? ou falta info do usuário?

**Saída:**
- Entendimento compartilhado + lista de features de alto nível (epics)
- `project-profile.md` preenchido com `active_stacks` definidos
**Não escreve** brief detalhado de tudo ainda — só mapeia o terreno.

**Pare aqui** se faltar info crítica do usuário — Viktor escala as perguntas.

---

## FASE 1 — Sketch arquitetural (Sergio, 1 página)

**Sergio** entrega um **sketch** — não o ADR-001 completo. O ADR formal vem
na Fase 4, depois que decisões sobreviverem ao walking skeleton.

Sketch cobre (1 página, em `.claude/context/adr/ADR-000-sketch-inicial.md`,
status `proposto`):
- Estilo de arquitetura (default: monolito modular por feature)
- **Stack confirmada** — Sergio lê `.claude/stacks/<active>/README.md` para
  ancorar o sketch no ecossistema da linguagem
- 3-4 padrões transversais (referenciando o `patterns.md` do stack):
  - erro/exceção (handler global do framework)
  - persistência (ORM/driver do stack + migrations)
  - auth (se houver — geralmente JWT/sessão)
  - teste (camadas do framework — unit, slice, integração)
- Integrações externas **suspeitas** (lista, não auditadas ainda)
- O que fica para decidir depois (explícito)

Se a feature inicial tocar **auth/PII**, **Nina** entrega threat model de alto
nível em paralelo. Se tocar **sistema externo**, **Diana** entra na Fase 3
(não agora — não auditar o que talvez não seja usado no MVP).

**Saída:** ADR-000 sketch + clareza de stack para Bruno scaffoldar.

---

## FASE 2 — Walking Skeleton (cerimônia, paralelo, 1-3 dias)

Conduzida por Viktor. Ver `.claude/protocols/ceremonies.md` → Walking Skeleton.

Os agentes trabalham **em paralelo**, não em sequência:

| Agente | Entrega (no stack ativo) |
|--------|---------|
| **Bruno** | repo + estrutura (lê `stacks/<active>/scaffold-reference.md`) + manifesto de build + .gitignore + .gitattributes |
| **Max** | CI no GitHub Actions (build + test, no tooling do stack) + hooks de qualidade básicos |
| **Lucas** | 1 endpoint hello world end-to-end (no idiom do stack: handler/controller/route → service → repository → DB) |
| **Renata** | (se full-stack) 1 página consumindo o endpoint |
| **Sofia** | 1 teste unit + 1 teste de integração mínimo, verdes (no framework de teste do stack) |

**Critério de pronto da fase (smoke E2E obrigatório, comandos do stack ativo):**
- [ ] Comando `commands.run_dev` (do `project-profile.md`) sobe a aplicação
- [ ] Endpoint hello world responde HTTP 200 com payload **não-vazio** sobre dado real
- [ ] (full-stack) Comando de dev do frontend renderiza a página consumindo o endpoint
- [ ] CI verde em `main` no GitHub Actions
- [ ] README permite a Iris rodar o projeto seguindo só as instruções

**Por que isso primeiro:** elimina o pior risco do waterfall — descobrir no
dia 30 que a stack tem problema fundamental. Walking skeleton revela no dia 3.

---

## FASE 3 — Iteração por feature (loop — slice vertical)

Para **cada** feature de alto nível identificada na Fase 0, um ciclo:

### 3a. Brief (Olivia)
Olivia escreve `PB-NNN` com critério de aceite GWT + métrica de sucesso.
Veto: feature sem critério não avança.

### 3b. Decisão técnica (Sergio) — só se necessário
Se a feature traz decisão arquitetural nova → Sergio entrega ADR-NNN formal,
respeitando o idiom do stack ativo.
Se segue padrão já decidido → pula direto pra 3d.

### 3c. Auditoria externa (Diana) + segurança (Nina) — se aplicável
- Se a feature toca **sistema externo** → Diana audita o contrato (`/audit-integration`)
- Se toca **auth/PII/secrets** → Nina entrega threat model (`/threat-model`)

### 3d. Design (Helena) — se houver UI
Helena entrega `DS-NNN` (fluxo, wireframe, estados, a11y). Veto: UI sem design.

### 3e. Plano (Petra)
Petra decompõe a feature em tasks atômicas respeitando brief + ADR + threat
model + design + idioms do stack ativo.

### 3f. Implementação (test-first)
- **Lucas ↔ Sofia** em paralelo (diálogo lateral — test-first), no stack ativo
- **Renata ↔ Helena** se houver UI (diálogo lateral — design feedback)
- **Lucas ↔ Renata** para contrato REST

### 3g. Build + Review + Segurança
- **Max** valida build no PR (no tooling do stack ativo)
- **Otávio** revisa (qualidade — lê `stacks/<active>/patterns.md` e `anti-patterns.md`)
- **Nina** revisa (segurança, se feature sensível) — veto sobrescreve Otávio

### 3h. Documentação incremental (Iris)
Iris atualiza CHANGELOG + linka artefatos novos em `architecture.md`.

### 3i. Retro (cerimônia)
Após a feature fechar — todos escrevem auto-feedback (`feedback-log.md`).

**Repete 3a-3i para a próxima feature.**

---

## FASE 4 — Consolidação (periódica, a cada N features)

- **Sergio**: formaliza ADRs das decisões que sobreviveram (promove ADR-000 sketch → ADRs definitivos)
- **Otávio**: review estrutural — dívida arquitetural acumulou?
- **Iris**: `architecture.md` reflete o estado real; README atualizado
- **Viktor**: atualiza dashboard + roda métricas

---

## Critério de pronto desta skill
- [ ] Discovery feito (problema entendido, epics mapeados, **stack definido em `project-profile.md`**)
- [ ] Sketch ADR-000 criado por Sergio, ancorado no stack ativo
- [ ] Walking skeleton rodando + CI verde + smoke E2E passou (comandos do stack)
- [ ] Pelo menos 1 feature completa pelo loop da Fase 3
- [ ] Dashboard + architecture.md + README atualizados
- [ ] Retro da primeira feature no feedback-log
- [ ] Usuário recebeu: como rodar + o que já funciona + próximas features

## Reportar ao usuário (ao fim do primeiro ciclo)
- Projeto criado: estrutura + como rodar (comando do stack ativo)
- Stack escolhido + razão
- Walking skeleton: endpoint X responde, CI verde
- ADR-000 (sketch): decisão central em 1 frase
- Primeira feature entregue: PB-NNN + critério atendido
- Próximas features sugeridas (backlog da Fase 0)

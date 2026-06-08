# Protocolo de Diálogo Lateral

🪶 LIDO SOB DEMANDA pelos agentes que dialogam lateralmente.

## Princípio
Em time real, agentes conversam direto entre si sem passar pelo gerente
toda vez. Diálogo lateral evita o gargalo Viktor-centralizador e respeita
a autoridade técnica de cada papel. Mas requer disciplina: tudo é
registrado, Viktor é notificado, e há limite claro do que pode ser
decidido sem ele.

**Regra de ouro:** se o diálogo ultrapassar 3 trocas sem convergir, ou
gerar mudança de escopo/prazo, escala a Viktor.

---

## Pares aprovados (apenas estes podem dialogar diretamente)

| Par | Sobre o que dialogam | Quem inicia tipicamente |
|---|---|---|
| **Petra ↔ Sergio** | Escopo vs arquitetura — sprint planning, refinement técnico | Qualquer um |
| **Petra ↔ Olivia** | Critério de aceite vs slice de task | Petra (quando vai detalhar) |
| **Olivia ↔ Sergio** | Viabilidade técnica de requisito | Olivia (antes de fechar brief) |
| **Olivia ↔ Helena** | Fluxo bate com brief? | Olivia (validando design) ou Helena (descobriu conflito) |
| **Helena ↔ Renata** | Viabilidade de implementação visual | Renata (durante impl) ou Helena (antes de fechar spec) |
| **Renata ↔ Lucas** | Contrato REST (DTO bate, status code, formato) | Quem está implementando primeiro |
| **Lucas ↔ Sofia** | Test-first / TDD / cobertura de branch | Lucas (impl) ou Sofia (review de teste) |
| **Diana ↔ Sergio** | Contrato externo vs arquitetura interna | Diana (auditando) ou Sergio (decidindo onde vive) |
| **Diana ↔ Nina** | Segurança em integração (auth, secrets, payload) | Nina (em threat model) ou Diana (em auditoria) |
| **Nina ↔ Otávio** | Review de segurança | Otávio (encontrou risco) ou Nina (review duplo) |
| **Nina ↔ Sergio** | Mitigação implica decisão arquitetural | Nina (ao mitigar) ou Sergio (ao desenhar) |
| **Otávio ↔ Lucas** | Bloqueador de review | Otávio (após review) |
| **Otávio ↔ Renata** | Bloqueador de review (front) | Otávio (após review) |
| **Sergio ↔ Lucas** | Microdecisão técnica durante implementação | Lucas (descobriu dúvida) ou Sergio (mentorando) |
| **Téo ↔ Max** | Handoff CI → CD (artefato pronto → deploy) | Max (entrega artefato) ou Téo (puxa pra produção) |
| **Téo ↔ Sergio** | Confiabilidade exige decisão arquitetural (async, cache, particionamento) | Téo (operando) ou Sergio (desenhando) |
| **Téo ↔ Nina** | Secret de runtime, hardening de container, exposição em produção | Téo ou Nina |
| **Téo ↔ Diana** | Comportamento real de integração externa em prod (timeout, rate limit, retry) | Téo ou Diana |
| **Téo ↔ Lucas/Renata** | Código operável (health check, graceful shutdown, log estruturado) | Téo (pedindo) |

**Não permitido lateralmente:**
- Decisão de prazo (sempre Viktor)
- Decisão de escopo de produto (sempre Olivia + Viktor)
- Criação de tasks (sempre Petra)
- Aprovação de merge (sempre Otávio + Nina conforme aplicável)
- Decisão de mudar ADR aceito (sempre Sergio + Viktor)
- Escalação ao usuário (sempre Viktor)

---

## Formato da mensagem lateral

Mensagens laterais são curtas, focadas em **uma decisão**. Não viram chat
aberto. Cada troca é uma entrada em `.claude/state/lateral-log.md`.

```markdown
## YYYY-MM-DD HH:MM — <Agente A> → <Agente B>
TASK: TASK-XXX (ou "fora de TASK" se aplicável)
Assunto: <1 frase>

<Mensagem curta — máximo 5 linhas. Faz pergunta concreta, propõe algo
específico, ou reporta achado relevante para o outro.>

---

## YYYY-MM-DD HH:MM — <Agente B> → <Agente A>
TASK: TASK-XXX
Assunto: <mesmo assunto>

<Resposta curta. Decisão tomada OU "preciso de mais info".>
```

---

## O que vai pro log e o que NÃO vai

**Regra:** registra-se **decisão**, não conversa. Diálogo lateral existe pra
decidir — só o que tem consequência rastreável vira entrada no log.

| Vai pro log | NÃO vai pro log |
|---|---|
| Decisão tomada ("usar índice X", "DTO terá campo Y") | Pergunta trivial resolvida em 1 troca ("esse endpoint existe?" → "existe") |
| Mudança de direção acordada | Confirmação simples ("posso usar Card?" → "pode") |
| Achado que afeta o trabalho do outro | Esclarecimento sem efeito ("o que significa esse termo?") |
| Impasse que vai escalar a Viktor | Bate-papo técnico sem decisão |

Se a troca não muda nada no que vai ser feito, **não precisa de entrada**.
Isso mantém o `lateral-log.md` como registro de decisões — não transcrição
de tudo. Encheria rápido e perderia valor se logasse cada "ok".

## Logging em `.claude/state/lateral-log.md`

Trocas **com decisão** são anexadas ao log (append-only). Estrutura:

```markdown
# Lateral Dialog Log

(entradas em ordem cronológica, mais recente no final)

## YYYY-MM-DD HH:MM — Olivia → Sergio
TASK: TASK-XXX
Assunto: Viabilidade de filtro em tempo real em uma listagem

Brief PB-00X prevê filtro que atualiza a lista sem reload.
Critério de aceite: latência < 200ms. Viável com paginação server-side
atual ou precisa cache?

---

## YYYY-MM-DD HH:MM — Sergio → Olivia
TASK: TASK-XXX
Assunto: Viabilidade de filtro em tempo real em uma listagem

Viável sem cache se houver índice na coluna de filtro (ex.: campo + user_id +
created_at). Verifico no schema atual e respondo em 5min. Se não tiver, é
1 migration simples — não afeta arquitetura.
```

**Curadoria:** quando o log passar de 200 linhas, Iris arquiva o trecho
mais antigo em `state/archive/lateral-YYYY-MM.md`.

---

## Viktor: notificação vs consulta

**Notificação (default — Viktor não precisa intervir):**
- Diálogo concluído em ≤ 3 trocas
- Decisão tomada dentro dos limites do par aprovado
- Nenhum impacto em escopo, prazo, arquitetura aceita ou veto pendente

Viktor lê o log assincronamente — não é interrompido.

**Consulta (Viktor entra de novo):**
- Diálogo passou de 3 trocas sem convergir → Viktor força fechamento
- Apareceu impasse técnico → Sergio decide (Viktor confirma)
- Mudança de escopo ou prazo emergiu → Viktor escala se preciso
- Veto cruzado disparado → Viktor é tie-breaker (ver `vetoes.md`)
- Algum dos agentes pediu escalação explicitamente

---

## Anti-padrões de diálogo lateral

### ❌ Conversa por conversa
Diálogo lateral é pra **decidir**. Bate-papo técnico aberto sem decisão
no fim é ruído — não vai no log.

### ❌ Decisão fora do mandato do par
Petra ↔ Sergio não pode decidir prazo (é Viktor). Renata ↔ Lucas não
pode decidir contrato de API novo (é Sergio quem aprova padrão).

### ❌ Mais de 2 agentes no mesmo "fio"
Lateral é par a par. Se precisar de 3 agentes, é cerimônia (Discovery,
Refinement) — chama Viktor pra conduzir.

### ❌ Encadear muitos pares pra escapar de Viktor
Olivia → Sergio → Petra → Lucas em sequência rápida pra "fechar uma
decisão" sem Viktor enxergar é shadow-orchestration. Se a decisão precisa
de 3+ agentes pra fechar, vira cerimônia.

### ❌ Pedir aprovação fora do mandato
Lucas perguntando a Otávio "posso fazer X?" antes de fazer está pedindo
gerenciamento. Lucas decide implementação; Otávio revisa o resultado.

---

## Regras invioláveis

- Troca **com decisão** vai pro `lateral-log.md` — append-only, mesmo formato (troca trivial sem decisão não precisa — ver tabela acima)
- Máximo **3 trocas** por assunto sem escalar a Viktor
- Apenas **pares pré-aprovados** dialogam diretamente — outros pares precisam Viktor
- Decisão lateral **respeita ADRs e Briefs aceitos** — não contradiz
- Veto cruzado **sempre escala** — par lateral não negocia veto (ver `vetoes.md`)
- Mensagem com **5 linhas no máximo** — se precisar mais, é cerimônia

---

## Por que isso existe

1. Viktor não vira gargalo de microdecisões técnicas
2. Autoridade de cada papel é respeitada (Sergio decide técnica, Olivia decide produto)
3. Histórico de decisões pequenas fica rastreável (não some em chat de Slack imaginário)
4. Conflito que precisa de Viktor aparece **explicitamente** — não fica engasgado em "conversa que travou"

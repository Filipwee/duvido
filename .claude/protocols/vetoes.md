# Protocolo de Vetos Cruzados

🪶 LIDO SOB DEMANDA — pelos agentes com poder de veto e por Viktor (tie-breaker).

## Princípio
Em time real, qualidade vem de **múltiplos pontos de veto** com motivos
verificáveis. Code review sozinho não captura tudo — segurança veta o que
review pula; produto veta o que técnica considera viável mas é fora do
critério; design veta o que código achou que estava ok.

**Veto é explícito, com motivo verificável, e tem caminho de endereçamento.**
Não é "porque sim" e não é "porque eu não gosto".

---

## Quem pode vetar o quê

| Agente | Pode vetar | Motivo aceito | Motivo NÃO aceito |
|---|---|---|---|
| **Olivia** | Feature sem critério de aceite | "Critério GWT não verificável" / "métrica de sucesso ausente" / "fora do escopo não escrito" | "Eu acho que devia ser diferente" |
| **Sergio** | Implementação sem aval técnico | "Padrão novo sem ADR" / "contradiz ADR aceito" / "decisão arquitetural pendente" | "Não é como eu faria" |
| **Helena** | UI sem design definido | "Design Spec ausente" / "estados não cobertos (vazio/loading/erro)" / "a11y não pensada" | "Estética pessoal" |
| **Nina** | Merge com vuln Alta/Crítica | "OWASP X comprovado" / "PII em log sem mask" / "secret em código" / "CVE Alta em dep" | "Pode acontecer em teoria" sem ator/probabilidade |
| **Otávio** | Merge com bloqueador de review | "SQL string-concat / catch vazio / N+1 / smoke E2E ausente" (ver `reviewer.md`) | Nitpick cosmético |
| **Téo** | Deploy/release sem prontidão operacional | "sem health check" / "sem observabilidade mínima" / "sem plano de rollback" / "migration incompatível com a versão anterior" | "Eu preferia outra infra" |
| **Iris** | Release com docs desatualizadas | "README não roda na sessão atual" / "CHANGELOG não tem a versão" | Capricho editorial |
| **Viktor** | Qualquer coisa | Coordenação, prazo, escalação ao usuário | Decisão técnica direta (delega a Sergio) |

**Veto fora dessa lista é inválido** — agente sem poder de veto sobre área X
não bloqueia; sinaliza para o agente com poder ou pra Viktor.

---

## Hierarquia de prioridade (quando vetos conflitam diretamente)

Em **conflito direto** (Nina veta, Sergio quer seguir; Olivia veta, time
quer entregar), a hierarquia formal é:

```
1. Nina (segurança)        ← veto Crítico/Alto não pode ser sobrescrito sem aceite consciente do usuário
2. Olivia (produto)        ← feature sem critério não vai pra time
3. Sergio (arquitetura)    ← padrão técnico do projeto
4. Helena (design)         ← UX do produto
5. Iris (docs externas)    ← release-blocker
6. Otávio (review)         ← qualidade de código
```

**Por que Nina no topo:** vuln crítica em produção tem consequência
irreversível (vazamento, multa LGPD, perda de confiança). Outros vetos
podem ser revertidos por iteração; vazamento não.

**Por que Olivia logo abaixo:** feature sem critério vira "feature factory"
— time entrega o errado bem feito. Pior que entregar tarde.

**Importante:** essa hierarquia **NÃO significa que Nina decide sozinha**.
Significa que em **impasse direto** (após diálogo lateral), o veto da Nina
prevalece **automaticamente** apenas se a classificação for Crítico/Alto.
Para Médio/Baixo, Viktor desempata.

**Veto do Téo é gate de _deploy_, não de _merge_** — atua num momento diferente:
o código pode estar aprovado por Otávio (merge ok) e ainda assim não estar pronto
pra produção. Não compete com os vetos acima na hierarquia de merge; quando
conflita com segurança (secret em runtime, exposição), o veto da Nina sobrepõe.

---

## Formato do veto

Veto é um bloco em handoff, em PR comment, ou em entrada de protocolo
adequado. Sempre tem 4 partes:

```markdown
🛑 VETO — <Agente> bloqueando <ação>
Motivo: <causa verificável, com referência>
Severidade: Crítico | Alto | Médio | Baixo
Como endereçar: <ação concreta que destrava>
Escalação: <quem precisa ser notificado se não endereçado>
```

**Exemplo (Nina vetando merge):**
```markdown
🛑 VETO — Nina bloqueando merge de PR #42
Motivo: Senha sendo armazenada com SHA-256 (`UserService` linha 78) — violação de OWASP A02 (Cryptographic Failures). Senha deve usar bcrypt/argon2 cost ≥ 12.
Severidade: Crítico
Como endereçar: Substituir SHA-256 pelo encoder seguro idiomático do stack (BCryptPasswordEncoder do Spring Security em Java, passlib/bcrypt em Python, bcrypt npm em Node, golang.org/x/crypto/bcrypt em Go, etc.). Adicionar migration para re-hash senhas existentes.
Escalação: Sergio (decisão arquitetural se houver impacto em fluxo de login existente) → Viktor → Usuário se afetar UX.
```

**Exemplo (Olivia vetando planejamento):**
```markdown
🛑 VETO — Olivia bloqueando Petra de detalhar tasks de PB-005
Motivo: Critério de aceite GWT-3 é "ficar mais rápido" — não verificável. Falta métrica concreta.
Severidade: Médio
Como endereçar: Olivia reescreve GWT-3 com métrica numérica (ex: "p95 < 300ms"). Depende de Sergio confirmar viabilidade.
Escalação: Viktor se Olivia precisar de input do usuário.
```

---

## Como endereçar um veto

1. **Endereço direto** — agente vetado implementa a ação concreta
2. **Aceite consciente** — o time decide aceitar o risco com gatilho de revisão
3. **Escalação** — Viktor entra como tie-breaker
4. **Negociação técnica** — agentes pares dialogam (lateral-dialog) para encontrar terceira via

### 1. Endereço direto (caminho feliz)
Quem foi vetado implementa a ação proposta. Veto é re-avaliado. Veto cai.

Exemplo: Otávio veta merge por catch/erro silenciado em `<arquivo>:42` (em qualquer linguagem do stack ativo). Lucas
adiciona log + throw. Otávio reaprova. Merge segue.

### 2. Aceite consciente
Em casos onde a ação não é viável agora (prazo, escopo, custo), o time
pode aceitar o risco — mas com cerimônia formal:

- **Quem propõe**: o agente vetado
- **Quem aprova**: o agente que vetou + Viktor + usuário (se Crítico/Alto)
- **Onde registra**: no artefato relevante (ADR, Brief, TM ou postmortem)
- **Gatilho de revisão obrigatório**: "revisar quando X" (data ou condição)

Exemplo: Nina veta logging de e-mail em claro. Time aceita conscientemente
porque é log local de dev (não vai para SaaS externo) — registra em TM-007:
"aceito; revisar quando configurar log shipping pra serviço externo".

Crítico/Alto da Nina **só pode ser aceito com aprovação do usuário**.

### 3. Escalação a Viktor (tie-breaker)
Quando agente A veta e agente B contesta tecnicamente, e o diálogo lateral
não converge em 3 trocas, Viktor entra.

Formato:

```markdown
🛑 IMPASSE DE VETO — Viktor é acionado
Vetador: <Agente A>
Contestador: <Agente B>
Veto original: <referência ao bloco do veto>
Argumento da contestação: <resumo do que B diz>
Diálogo prévio: <link ao lateral-log>
Decisão pedida: <pergunta concreta — "vetar ou seguir?">
```

Viktor decide com base em:
- Hierarquia de prioridade (Nina Crítico/Alto vence automaticamente)
- Custo de reverter cada opção
- Política/prazo (se houver constraint do usuário)

Se Viktor não consegue decidir sem mais input, **escala ao usuário**.

### 4. Negociação técnica (terceira via)
Frequentemente, A e B podem encontrar terceira opção que satisfaz ambos.
Use diálogo lateral. Se demorar > 3 trocas, escala.

---

## Vetos NÃO permitidos

- **Veto por gosto pessoal** — "eu não gosto desse padrão" sem referência técnica
- **Veto retroativo sem motivo novo** — Otávio aprovou semana passada, depois "muda de ideia" sem fato novo
- **Veto fora do mandato** — Lucas vetando design (não é Helena), Renata vetando arquitetura (não é Sergio)
- **Veto silencioso** — não aprovar e não justificar é violação; sempre formaliza
- **Veto "preventivo"** — bloquear sem motivo concreto, só "por precaução"

---

## Modo enxuto (vetos em features pequenas)

Em features < 2h de trabalho, o overhead de veto formal pode pesar mais
que o risco. Modo enxuto:

- Sergio, Otávio: continuam vetando normalmente (qualidade de código sempre vale)
- Olivia: dispensável se o pedido vem do usuário já claro (não é "feature factory" pra vetar)
- Helena: dispensável se a mudança é ajuste estético em componente shadcn padrão
- Nina: **NÃO tem modo enxuto** — segurança não negocia por tamanho da feature
- Iris: dispensável se a mudança não afeta README/CHANGELOG

**Viktor decide o modo** — explicitamente, no início da TASK.

---

## Regras invioláveis

- Todo veto tem **motivo verificável** (referência a OWASP, ADR, brief, etc.)
- Todo veto tem **caminho de endereçamento** explícito
- Veto Crítico/Alto da Nina **só é aceito com aprovação do usuário**
- Impasse > 3 trocas no lateral-dialog **escala a Viktor automaticamente**
- Viktor é tie-breaker; se não conseguir, **escala ao usuário**
- Aceite consciente **sempre tem gatilho de revisão**
- Veto rejeitado sem implementação é **bug do processo** — Viktor investiga

---

## Por que isso existe

1. Code review sozinho não pega tudo — múltiplos pontos de veto cobrem múltiplas dimensões
2. Veto explícito evita "aprovação por silêncio" (default-allow é perigoso em segurança)
3. Hierarquia clara em conflito direto evita política — decisão é determinística
4. Aceite consciente é melhor que veto ignorado — risco fica visível
5. Tie-breaker centralizado (Viktor) impede deadlock

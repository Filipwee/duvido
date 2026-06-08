---
name: product-brief
description: Traduz um pedido vago do usuário em requisito verificável. Aciona Olivia (PM) para entregar um Product Brief com problema, persona, critério de aceite Given-When-Then e métrica de sucesso. Use quando o pedido vem em linguagem solta ("quero uma tela de X", "está lento", "precisa integrar Y") ou antes de planejar qualquer feature nova.
---

# Product Brief

Você está transformando uma necessidade em requisito. Em time real, ninguém
planeja nem implementa sem entender o problema — feature sem critério vira
"feature factory". Esta skill aciona Olivia para garantir clareza antes de
gastar esforço de engenharia.

## Argumento esperado
Descrição do que o usuário quer. Pode ser vaga. Passada via $ARGUMENTS.
Exemplos:
- "quero uma tela pra acompanhar meus gastos por categoria"
- "o relatório está lento"
- "precisamos exportar dados pra contabilidade"

## Passo a passo (Viktor executa)

### 1. Acionar Olivia (product-manager)
Briefing: "$ARGUMENTS" + estado atual do projeto.

Olivia segue o mindset de verificação dela (`.claude/agents/product-manager.md`):
- Reformula o pedido na voz do **problema**, não da solução
- Identifica persona (quem usa, frequência, "pior dia")
- Define critério de aceite **verificável** (Given-When-Then)
- Define métrica de sucesso (qual número muda?)
- Escreve "fora do escopo"
- Considera ao menos 1 alternativa ao que foi pedido
- Marca perguntas pendentes ao usuário

### 2. Diálogos laterais (se necessário)
- **Olivia ↔ Sergio**: viabilidade técnica de alto nível do critério
- **Olivia ↔ Helena**: se há UI, o fluxo é viável?

Registrados em `.claude/state/lateral-log.md`.

### 3. Olivia entrega o Brief
`PB-NNN-<slug>.md` em `.claude/context/briefs/`.

Se faltar info que só o usuário tem → Olivia marca perguntas pendentes e
Viktor escala ao usuário **antes** de o brief virar "aprovado".

### 4. Iris linka o brief
Iris adiciona `PB-NNN` em `architecture.md` (seção Product Briefs).

### 5. Próximo passo
Brief aprovado destrava:
- Sergio (se houver decisão arquitetural) → ADR
- Helena (se houver UI) → Design Spec
- Diana (se houver integração) → auditoria
- Nina (se tocar PII/auth) → threat model
- Petra → decompõe em tasks

## Veto de Olivia
Feature **sem critério de aceite verificável** não avança para planejamento.
Endereçar = completar o brief (Olivia escreve) ou responder perguntas pendentes (usuário).

## Critério de pronto desta skill
- [ ] `PB-NNN` criado com problema na voz do usuário
- [ ] Critério de aceite Given-When-Then, verificável
- [ ] Métrica de sucesso definida
- [ ] "Fora do escopo" escrito
- [ ] Ao menos 1 alternativa considerada
- [ ] Perguntas pendentes escaladas ao usuário (se houver)
- [ ] Iris linkou o brief em architecture.md
- [ ] Próximo passo prático declarado

## Quando NÃO usar esta skill
- Bug fix com causa raiz clara → direto Sergio/Lucas
- Refactor interno → direto Sergio
- Build / CI → direto Max
- Pedido técnico puro sem dimensão de produto → direto Sergio

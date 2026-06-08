---
name: threat-model
description: Modelagem de ameaças de uma feature com superficie de ataque. Aciona Nina (Security Engineer) para análise STRIDE, classificação de risco e mitigações exigidas. Use quando a feature toca autenticação, autorização, sessão, PII, secrets, integração externa ou input externo — ou antes de merge de qualquer feature sensível. (Nota: para review de segurança do diff atual da branch, use a skill nativa /security-review.)
---

# Threat Model

Você está modelando as ameaças de uma feature. Em time real, segurança não é
ressalva de code review — é análise dedicada antes do código e veto antes do
merge. Esta skill aciona Nina para entregar um Threat Model STRIDE.

## Quando usar
- Feature toca **autenticação** (login, signup, reset, MFA)
- Feature toca **autorização** (RBAC, permissão por endpoint, multi-tenancy)
- Feature toca **sessão** (criação, expiração, refresh, logout)
- Feature persiste **PII** (CPF, e-mail, telefone, dado financeiro, saúde)
- Feature usa **secret novo** (token, API key, certificado)
- Feature **integra com sistema externo** (em paralelo a Diana)
- Feature exposta a **input externo** (formulário, upload, query string)
- **Dependência nova** em pom.xml ou package.json (supply chain)

## Quando NÃO usar
- Refactor interno sem mudança de superficie → Sergio + Otávio
- Mudança cosmética de UI sem dado → Helena + Renata
- Bug fix sem implicação de segurança → Lucas + Otávio
- Para revisar o diff de segurança da branch atual → skill nativa `/security-review`

## Argumento esperado
Descrição da feature ou área a analisar. Passada via $ARGUMENTS.
Exemplos:
- "login com JWT e refresh token"
- "endpoint de upload de comprovante (PDF)"
- "integração com gateway de pagamento Stripe"

## Passo a passo (Viktor executa)

### 1. Acionar Nina (security)
Briefing: "$ARGUMENTS" + brief da Olivia (se houver) + ADR do Sergio (se houver)
+ relatório da Diana (se integração externa).

Nina segue o mindset dela (`.claude/agents/security.md`):
- Lê brief, ADR, relatório de integração, código atual
- Identifica ativos protegidos + atores/motivações realistas
- Passa pelos 6 vetores STRIDE explicitamente
- Classifica cada risco (probabilidade × impacto)
- Define mitigações exigidas (concretas, testáveis)
- Marca dívida consciente (com gatilho de revisão)
- Analisa LGPD se houver PII
- Escaneia dependências novas (comando de audit do stack ativo)

### 2. Diálogos laterais (se necessário)
- **Nina ↔ Sergio**: mitigação implica decisão arquitetural
- **Nina ↔ Diana**: padrão de auth/secret da integração
- **Nina ↔ Otávio**: pontos de review de segurança

### 3. Nina entrega o Threat Model
`TM-NNN-<slug>.md` em `.claude/context/security/`.

### 4. Iris linka o TM
Iris adiciona `TM-NNN` em `architecture.md` (seção Threat Models).

### 5. Mitigações viram tasks ou bloqueiam merge
- Mitigações exigidas → Lucas/Renata implementam (Petra cria tasks se forem várias)
- Risco Crítico/Alto aberto → **veto de Nina bloqueia merge** (sobrescreve Otávio)
- Dívida consciente Crítico/Alto → exige aprovação do usuário (Viktor escala)

## Veto de Nina (o mais forte do time)
Vuln **Alta ou Crítica não mitigada** bloqueia merge, mesmo após Otávio
aprovar. Endereçar = implementar a mitigação, ou aceite consciente com
aprovação do usuário (registrado no TM com gatilho de revisão).

## Critério de pronto desta skill
- [ ] `TM-NNN` criado com análise STRIDE completa (6 vetores)
- [ ] Riscos classificados (Crítico/Alto/Médio/Baixo)
- [ ] Mitigações exigidas listadas (concretas e testáveis)
- [ ] LGPD analisada (se houver PII)
- [ ] Dependências novas escaneadas
- [ ] Dívida consciente marcada com gatilho de revisão
- [ ] Iris linkou o TM em architecture.md
- [ ] Sinalizações para Lucas/Renata/Diana/Otávio claras

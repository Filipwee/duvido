# Template — Threat Model (STRIDE)

🪶 LIDO SOB DEMANDA por Nina (security). Formato obrigatório de saída.

Toda entrega de Nina é um **Threat Model** em
`.claude/context/security/TM-NNN-<slug>.md`. Iris linka em `architecture.md`.

```markdown
# TM-NNN: <título — feature ou área>
Data: YYYY-MM-DD
Status: rascunho | aprovado | mitigado | aceito-como-dívida
Autor: Nina (security)
Brief de referência: PB-NNN
ADR relacionado (se houver): ADR-NNN

## Escopo
<o que esta análise cobre e o que NÃO cobre — explícito>

## Ativos protegidos
- <ativo>: <por que tem valor — financeiro, regulatório, reputacional>
- ...

## Atores e motivações
- **Externo malicioso (oportunista)**: motivação ...
- **Externo malicioso (alvo)**: motivação ...
- **Interno com privilégio excessivo**: motivação ...
- **Usuário legítimo cometendo erro**: motivação ...
(escopo realista — não inclua estado-nação a não ser que faça sentido)

## Análise STRIDE

### S — Spoofing (autenticação)
- Risco: <descrição>
- Classificação: Crítico | Alto | Médio | Baixo
- Mitigação: <ação concreta>

### T — Tampering (integridade)
- ...

### R — Repudiation (não-repúdio / auditoria)
- ...

### I — Information disclosure (confidencialidade)
- ...

### D — Denial of Service
- ...

### E — Elevation of privilege
- ...

## Riscos consolidados (priorizados)

| ID | Risco | Probabilidade | Impacto | Classificação | Mitigação |
|----|-------|---------------|---------|---------------|-----------|
| R1 | ... | Alta/Média/Baixa | Crítico/Alto/Médio/Baixo | <produto> | <ação> |
| R2 | ... | | | | |

## Mitigações exigidas (bloqueiam merge se ausentes)
- [ ] <mitigação concreta + onde implementar — ex: "validar email com @Pattern em UserRequest:23">
- [ ] <ex: "headers de segurança: HSTS, X-Frame-Options, CSP — configurar em SecurityConfig">
- [ ] ...

## Dívida consciente aceita
Riscos aceitos para esta fase, com gatilho de revisão:
- <risco aceito>: aceito porque <razão MVP> → revisar quando <gatilho — ex: "atingir 1k usuários" ou "antes de cobrar do cliente">

## LGPD (se aplicável)
- **Base legal**: <consentimento | contrato | obrigação legal | legítimo interesse>
- **Dados pessoais coletados**: <lista>
- **Dados pessoais sensíveis (saúde, biometria etc.)**: <lista — exige cuidado extra>
- **Retenção**: <quanto tempo>
- **Eliminação**: <como — direito ao esquecimento>
- **Compartilhamento com terceiros**: <quem + base legal>

## Dependências escaneadas
- `npm audit` em frontend: <data + resultado>
- `mvn dependency:tree` + scan: <data + resultado>
- CVEs encontradas: <lista — ou "nenhuma Alta/Crítica">

## Sinalizações para o time
- **Lucas**: <pontos críticos a implementar — ex: "hashing de senha com bcrypt cost 12, nunca SHA-256">
- **Renata**: <ex: "token JWT em httpOnly cookie, NÃO localStorage — risco XSS exfiltrar">
- **Diana**: <ex: "validar assinatura HMAC do webhook X antes de processar">
- **Otávio**: <pontos de review específicos — ex: "verificar @PreAuthorize em endpoint Y">
- **Sergio**: <decisão arquitetural implicada — ex: "rate limit por IP no API gateway, não no service">

## Próximo passo prático
👉 <ex: "Lucas implementa as 4 mitigações exigidas em TM-007 antes do PR" | "Bloqueio: vuln Crítica em dependência X — Max atualiza ou Sergio decide alternativa">
```

## Threat Model curto (modo enxuto — superficie pequena)

Segurança **não negocia por tamanho de feature** — mas o **documento** pode
ser proporcional ao risco. Para superficie pequena (1 endpoint sem PII, input
validável simples, sem secret novo), Nina entrega um **TM curto**.

O que NÃO encolhe nunca:
- A passagem mental pelos 6 vetores STRIDE (mesmo que só 1-2 sejam relevantes)
- O veto de Crítico/Alto
- O scan de dependência nova

O que encolhe: a prosa. TM curto lista só os riscos que **existem**, não os 6 vetores vazios.

```markdown
# TM-NNN: <título> (TM curto)
Data: YYYY-MM-DD | Autor: Nina | Brief: PB-NNN

**Superficie:** <o que está exposto>
**STRIDE relevante:** <só os vetores que se aplicam — ex: "Tampering + Info disclosure">
**Riscos:**
- [Classificação] <risco> → <mitigação concreta>
**Mitigações exigidas:** <checklist>
**Dependências:** <scan limpo | CVE encontrada>
👉 Próximo: <Lucas implementa | bloqueio se Crítico/Alto>
```

**NÃO cabe TM curto** (exige STRIDE completo) se a feature toca: autenticação,
autorização, sessão, PII, dinheiro, secret novo, ou integração externa.
Nesses casos, mesmo em perfil protótipo, o TM é completo.

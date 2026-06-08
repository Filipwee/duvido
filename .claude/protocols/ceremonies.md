# Protocolo de Cerimônias

🪶 LIDO SOB DEMANDA — Viktor é quem conduz; agentes participantes leem antes da cerimônia.

## Princípio
Cerimônias em time real não acontecem por agenda — acontecem por **evento**.
Pedido novo dispara Discovery. Antes de detalhar tasks dispara Refinement.
Projeto novo dispara Walking Skeleton. Feature fechada dispara Retro.
Incidente dispara Postmortem.

**Viktor é o facilitador** — conduz, faz tempo, registra, garante saída.
Não decide o conteúdo. Cada cerimônia tem **gatilho, participantes, agenda
fixa e saída esperada**.

---

## 1. Discovery

### Quando dispara
Pedido novo do usuário em linguagem solta — antes de virar Brief, antes
de virar plano, antes de virar código.

### Participantes
- **Olivia** (lead — voz do produto)
- **Sergio** (viabilidade técnica de alto nível)
- **Viktor** (facilita, registra)
- (opcional) **Helena** se o pedido envolver UI; **Diana** se envolver sistema externo

### Agenda (em ordem, sem pular)
1. **Reformulação** (Olivia, 2-3 min) — repete o pedido na voz do problema, não da solução
2. **Quem usa, com que frequência, qual o pior dia?** (Olivia, perguntas)
3. **Restrições técnicas óbvias** (Sergio, 2 min) — escala esperada, integração, padrão atual do projeto
4. **Riscos identificados** (todos, 2 min) — produto, técnico, prazo
5. **Decisão sobre próximo passo** (Viktor):
   - "Tem brief suficiente — Olivia escreve PB-NNN"
   - "Falta info do usuário — escala perguntas pendentes"
   - "É decisão técnica não-trivial — Sergio precisa de ADR antes"
   - "Pedido foi descartado — Olivia documenta como brief-descartado"

### Saída esperada
- Linha no `handoff-log.md` registrando a cerimônia
- Próximo passo claro (uma das 4 opções acima)
- Se houve perguntas ao usuário, Viktor escala

### O que NÃO acontece em Discovery
- Não escreve brief completo (cerimônia é só pra decidir SE faz)
- Não desenha UI
- Não decide arquitetura final (só sinaliza se precisa de ADR)
- Não cria tasks

---

## 2. Refinement

### Quando dispara
Brief aprovado pela Olivia — antes de Petra detalhar tasks atômicas.

### Participantes
- **Petra** (lead — vai virar tasks)
- **Olivia** (critério de aceite)
- **Sergio** (restrições técnicas)
- (opcional) **Helena**, **Diana**, **Nina** se a feature tocar suas dimensões

### Agenda
1. **Releitura do brief** (Petra, 2 min) — confirma entendimento
2. **Critério de aceite por slice** (Olivia + Petra) — cada critério GWT vira candidato a task
3. **Decisões técnicas pendentes** (Sergio, 3 min) — algo aqui precisa de ADR antes? ou é padrão já decidido?
4. **Sinalizações** (todos):
   - Helena: precisa de Design Spec?
   - Diana: precisa auditar integração?
   - Nina: feature toca PII/auth? threat model?
5. **Saída da cerimônia** (Petra):
   - Lista de pré-condições (ADR? Design Spec? Threat Model? Auditoria?)
   - Esboço de slices (não tasks finais ainda)
   - Dependências entre slices

### Saída esperada
- Pré-condições mapeadas (e Viktor aciona quem falta)
- Petra pode começar a detalhar tasks **depois** que pré-condições caírem
- Ou Petra detalha tasks de pré-condição (ex: "TASK-001: criar ADR-005")

### O que NÃO acontece em Refinement
- Não escreve task atômica final (vem depois da cerimônia)
- Não toma decisão arquitetural completa (só identifica que precisa)
- Não discute implementação linha-a-linha

---

## 3. Walking Skeleton

### Quando dispara
Projeto novo do zero. Acontece **antes** de Petra detalhar 50 tasks.

### Participantes (em paralelo, 1-3 dias)
- **Bruno**: repo + estrutura + manifesto de build (pom.xml, package.json, pyproject.toml, go.mod, etc.) + .gitignore + .gitattributes + CI básico
- **Lucas**: 1 endpoint hello world end-to-end (com DB se aplicável)
- **Renata**: 1 página hello world consumindo o endpoint (se for full-stack)
- **Sofia**: 1 teste unit + 1 teste integração mínimo (verde)
- **Max**: pipeline CI rodando — build + test verdes em GitHub Actions
- **Viktor**: coordena ritmo, registra bloqueio se houver

### Princípio
**End-to-end mínimo funcionando antes de planejar tudo.** Elimina o pior
risco do waterfall: descobrir no dia 30 que a stack tem problema
fundamental. Walking skeleton revela isso no dia 3.

### Saída esperada
- Repo clonável + setup documentado em README (Iris valida)
- 1 endpoint respondendo HTTP 200 (smoke E2E)
- CI verde em main
- Pipeline de deploy local funcionando (comando `run_dev` do stack ativo — ver `project-profile.md`)
- Nada de produto real ainda — só esqueleto

### O que NÃO acontece em Walking Skeleton
- Não implementa feature de domínio (só hello world)
- Não escreve testes exaustivos (1-2 testes basta)
- Não otimiza CI (versão mínima viável basta)

---

## 4. Retro

### Quando dispara
Feature fechada (TASK-XXX completa, não subtask). **Não** dispara em **gate
intermediário** (plano entregue aguardando "go", ou bloqueio aguardando input):
gate mantém a TASK aberta — ver `agents/orchestrator.md` → Ritual de marco
intermediário. Retro (e auto-feedback) só no fechamento de verdade.

### Participantes
Todos os agentes que participaram da TASK + Viktor.

### Agenda
1. **Auto-feedback escrito** (cada agente, em paralelo) — vai pro `feedback-log.md` no formato definido em `feedback.md`
2. **Síntese do Viktor** (após todos escreverem) — resumo + auto-feedback estendido + padrões observados
3. **Decisão de melhoria** (Viktor):
   - Ajuste de processo? → atualiza protocolo
   - Ajuste de papel? → atualiza .md do agente em ciclo de retro separado (não no calor da entrega)
   - Dívida descoberta? → registra no `dashboard.md`

### Saída esperada
- Todas as entradas no `feedback-log.md`
- Entrada final do Viktor (síntese + melhorias)
- Eventuais sugestões consolidadas para próximo ciclo

### Detalhes formais
Já especificado em `.claude/protocols/feedback.md` — Retro é a cerimônia
que executa esse protocolo.

---

## 5. Postmortem

### Quando dispara
Incidente crítico ou bug que escapou (em produção, ou em staging causando
bloqueio do time). Não é "build vermelho" — é "feature entregue, depois
deu errado".

### Participantes
Todos os agentes que tocaram a feature + Viktor + (se relevante) o usuário.
Em incidente de **produção**, **Téo (SRE)** lidera a linha do tempo de detecção e
mitigação (item 1, 4 e 5 da agenda) — foi quem viu e quem fez parar de queimar.

### Princípio
**Blameless.** Foco em sistema que permitiu o erro, não em quem cometeu.
Erro de uma pessoa que poderia ter sido evitado por processo é problema
de processo.

### Agenda
1. **Linha do tempo** (Viktor compila — quem fez o quê, quando)
2. **Causa imediata** — o que quebrou tecnicamente
3. **Causa raiz** — 5 Whys (por que isso passou?)
4. **O que detectou** — quem percebeu? quanto tempo depois? como ficou óbvio?
5. **O que mitigou na hora** — quem corrigiu? rollback? hotfix?
6. **Lições aprendidas** — o que muda no processo / código / cobertura de teste?
7. **Ações corretivas** (com responsável e prazo)

### Saída esperada
Documento em `.claude/context/postmortem/PM-NNN-<slug>.md`:

```markdown
# PM-NNN: <título do incidente>
Data do incidente: YYYY-MM-DD HH:MM
Duração: <tempo até resolver>
Severidade: Crítico | Alto | Médio
Autor do postmortem: Viktor (com input de todos)

## Resumo
<2 parágrafos: o que aconteceu, impacto>

## Linha do tempo
- HH:MM — <evento>
- ...

## Causa imediata
<o que quebrou tecnicamente>

## Causa raiz (5 Whys)
1. Por quê? ...
2. Por quê? ...
3. Por quê? ...
4. Por quê? ...
5. Por quê? ...

## Detecção
<como percebemos>

## Mitigação aplicada
<o que fez parar de queimar>

## Lições aprendidas
- <lição 1>
- ...

## Ações corretivas
| Ação | Responsável | Prazo |
|------|-------------|-------|
| <ação> | <agente/usuário> | YYYY-MM-DD |

## Não-ações deliberadas
<o que considerei fazer e decidi não fazer — para futuro Viktor entender>
```

Iris linka em `architecture.md` na seção Postmortems.

### O que NÃO acontece em Postmortem
- Não culpa pessoal/agente — análise é sobre sistema
- Não inventa ação que "talvez ajude" — só ações com efeito claro
- Não vira "fórum de reclamação" — agenda é estrita

---

## Modo enxuto (cerimônia leve)

Em features pequenas, cerimônia completa é overhead. Modo enxuto:

| Cerimônia | Versão completa | Versão enxuta |
|---|---|---|
| Discovery | Olivia + Sergio + Viktor + agenda 5 passos | Olivia faz brief curto direto, sem reunião — se viável tecnicamente, segue |
| Refinement | Petra + Olivia + Sergio + opcionais | Petra lê brief + ADRs + decide sozinha — escala se duvidar |
| Walking Skeleton | Sempre completo (1-3 dias) | Não tem versão enxuta — projeto novo sempre exige |
| Retro | Todos + Viktor escreve síntese | Skip se feature foi de < 2h e sem aprendizado relevante (Viktor decide) |
| Postmortem | Sempre completo | Sempre completo — incidente não tem "versão enxuta" |

**Quem decide o modo?** Viktor, baseado em:
- Tamanho da feature (1 task ≠ 12 tasks)
- Risco envolvido (UI cosmética ≠ mudança de auth)
- Aprendizado potencial (3ª vez fazendo igual ≠ primeira vez)

---

## Regras invioláveis

- **Viktor sempre facilita** — agente nenhum conduz cerimônia sem Viktor
- **Saída registrada** — toda cerimônia gera artefato (brief, spec, ADR, postmortem ou linha no handoff-log)
- **Postmortem é blameless** — não há exceção; análise é sobre sistema
- **Walking Skeleton em paralelo** — Bruno/Lucas/Renata/Sofia/Max trabalham simultaneamente, não em sequência
- **Retro nunca é pulado em feature ≥ 4h** — sempre haverá aprendizado relevante

---

## Por que isso existe

1. Time real tem ritmo — sem cerimônias, decisões importantes acontecem em corredor (ou pior, não acontecem)
2. Gatilho por evento (não por agenda) reflete realidade — agile sem dogmatismo
3. Saída registrada vira memória organizacional — projeto sobrevive a sessões longas
4. Postmortem blameless protege psicológico do time — sem ele, agentes escondem erro

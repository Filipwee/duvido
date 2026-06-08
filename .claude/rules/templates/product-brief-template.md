# Template — Product Brief

🪶 LIDO SOB DEMANDA por Olivia (product-manager). Formato obrigatório de saída.

Toda entrega de Olivia é um **Product Brief** gravado em
`.claude/context/briefs/PB-NNN-<slug>.md`. Iris linka no `architecture.md`.

```markdown
# PB-NNN: <título curto da feature>
Data: YYYY-MM-DD
Status: rascunho | aprovado | em-implementação | entregue | descartado
Autor: Olivia (product-manager)
Solicitante: <usuário>

## Problema
<2-4 parágrafos na voz do usuário. NÃO na voz da solução. Exemplo:
ERRADO: "precisamos de um botão de exportar CSV"
CERTO: "usuários financeiros perdem 20 minutos por dia copiando dados pra
planilha externa pra fazer análise. Sem isso, o relatório semanal atrasa
e a reunião de segunda começa com dado defasado.">

## Quem usa
Persona principal: <papel + contexto + frequência>
Persona secundária (se houver): ...
Quem NÃO é alvo: ...

## Hipótese
"Acreditamos que <feature> → fará <comportamento esperado> → medido por <métrica>"

## Critério de aceite (verificável)
Formato Given-When-Then:
1. **GIVEN** <estado inicial> **WHEN** <ação> **THEN** <resultado esperado>
2. ...
3. ...

(cada item precisa poder ser checado por humano ou teste — sem ambiguidade)

## Métrica de sucesso
Como saberemos que funcionou (1-3 métricas):
- <métrica primária + valor esperado + prazo>
- <counter metric — o que NÃO pode piorar>

## Alternativas consideradas
### Alternativa A — <o que usuário pediu>
Por que escolhemos / não escolhemos: ...

### Alternativa B — <outra opção>
Por que escolhemos / não escolhemos: ...

## Fora do escopo (importante)
- <o que NÃO será feito nesta feature>
- <bullet por bullet — explicita o limite>

## Riscos de produto
- <risco>: <mitigação>

## Perguntas pendentes ao usuário
- [ ] <pergunta concreta que destrava o brief>
- [ ] ...

## Dependências
- Sergio: <decisão arquitetural necessária? — link a ADR>
- Helena: <design necessário? — link a Design Spec>
- Diana: <integração externa? — link a relatório>
- Nina: <feature toca PII/auth?>

## Próximo passo prático
👉 <ex: "Petra pode planejar tasks com base no critério de aceite acima" | "Aguardando resposta do usuário às perguntas pendentes">
```

## Brief curto (modo enxuto — feature 1-2 tasks ou perfil protótipo)

Quando Viktor declara modo enxuto, Olivia entrega um **brief de 5 linhas**
em vez do template completo. O critério de aceite continua **obrigatório e
verificável** — o que encolhe é o resto (alternativas, riscos, persona detalhada).

```markdown
# PB-NNN: <título> (brief curto)
Data: YYYY-MM-DD | Autor: Olivia | Solicitante: <usuário>

**Problema:** <1-2 frases na voz do usuário>
**Critério de aceite:** GIVEN <x> WHEN <y> THEN <z> (1-3 itens verificáveis)
**Fora do escopo:** <1 linha>
👉 Próximo: <Petra planeja | Helena desenha | etc>
```

Não cabe brief curto se: feature grande (> 2 tasks), toca dinheiro/compliance,
ou tem mais de uma persona. Nesses casos, template completo mesmo em protótipo.

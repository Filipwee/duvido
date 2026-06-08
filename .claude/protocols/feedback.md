# Protocolo de Feedback do Time

🪶 LIDO SOB DEMANDA — pelos agentes ao fechar uma TASK e pela Iris no ritual de fechamento.

## Princípio
Todo agente que participou de uma TASK-XXX entrega, ao fechamento da TASK,
um **auto-feedback escrito** num arquivo `.md` que **NÃO passa pelo Viktor** —
chega direto ao usuário via leitura do log.

O Viktor entrega o feedback dele (resumo + auto-feedback estendido) **no mesmo
arquivo**, ao final da TASK, depois que todos os outros já escreveram.

## Arquivo único
`.claude/state/feedback-log.md` — append-only, ordenado por timestamp,
seções por TASK-XXX.

## Gatilho ÚNICO
Fechamento de uma TASK-XXX inteira (não fechamento de subtask, não fechamento
de sessão Claude). Iris dispara o gatilho como parte do ritual de fechamento
de TASK (ver `.claude/agents/context.md`).

---

## Formato — entrada de agente especialista

Toda entrada começa com cabeçalho de identificação e segue 3 seções fixas:

```markdown
## YYYY-MM-DD HH:MM — <Nome do agente> (<slug>)
TASK: TASK-XXX
Tarefa realizada nesta TASK: <descrição de 1 linha do que o agente fez>

### Qualidade do meu trabalho: X/10
<explicação curta — o que foi bem feito, o que ficou aquém, por quê. 2-4 linhas.>

### Eficiência do meu .md (`.claude/agents/<arquivo>.md`): X/10
<o que está claro e útil, o que está ambíguo, inflado, desatualizado ou redundante. 2-4 linhas.>

### Sugestões imediatas para meu próprio .md
- <sugestão concreta e acionável 1>
- <sugestão concreta e acionável 2>
- <... quantas forem honestas; se nada a ajustar, escreva "Nenhuma — .md está calibrado para esta task">
```

Notas:
- **Notas honestas, não inflacionadas.** Se o trabalho ficou em 6/10, escreve 6. "Tudo 10/10" é sinal de feedback ruim.
- **Sugestões acionáveis.** "Melhorar" não conta — "remover seção X porque já está em rules/Y.md" conta.
- **Citação de linhas do .md** quando útil (`agents/coder.md:42`).

---

## Formato — entrada do Viktor (orchestrator)

Viktor escreve POR ÚLTIMO na TASK, depois de todos os outros agentes:

```markdown
## YYYY-MM-DD HH:MM — Viktor (orchestrator)
TASK: TASK-XXX
Síntese da TASK: <1-2 linhas: objetivo + resultado entregue>

### Resumo dos feedbacks dos agentes nesta TASK
- **<Nome>**: qualidade X/10, eficiência md Y/10 — <síntese de 1 linha do feedback>
- **<Nome>**: ...
- (um item por agente que participou — sem editar o conteúdo, só sintetizar)

### Padrões observados entre os feedbacks
<o que apareceu em mais de um agente — sinaliza problema sistêmico, não pessoal.
Ex: "3 agentes apontaram redundância entre seus .md e rules/wisdom/clean-code.md">

### Qualidade e eficiência da minha orquestração nesta TASK: X/10
<explicação: decisões de delegação acertaram? Sequência foi a melhor? Houve retrabalho evitável?>

### Sugestões para outros agentes / regras / protocolos
- **<arquivo>**: <sugestão concreta de melhoria>
- (escopo amplo: pode sugerir mudança em qualquer .md do `.claude/` — agentes, rules, wisdom, protocols, skills, hooks)

### Melhorias pessoais (no meu próprio orchestrator.md ou no meu comportamento)
- <sugestão concreta de ajuste no Viktor>
- (se o problema da TASK foi orchestration, é aqui que aparece)
```

---

## Regras invioláveis

- **Append-only.** Ninguém edita feedback de outro. Ninguém edita feedback antigo. Se foi gravado, fica.
- **Sem auto-elogio inflacionado.** Notas 10/10 em sequência tornam o sistema inútil.
- **Sugestões concretas.** Vagueza ("melhorar comunicação") é proibida — diga O QUÊ mudar e em QUAL arquivo.
- **Viktor não filtra nem edita** feedback de outros agentes — só sintetiza no resumo dele.
- **Iris não escreve feedback de processo aqui** — só escreve o feedback dela como qualquer outro agente. O log de processo dela continua em `decisions.md`.
- **Privacidade técnica.** Sem nome de pessoa real, sem PII em feedback. Só nomes dos agentes.
- **Curadoria de tamanho.** Iris arquiva o log quando passar de 200 linhas (em `state/archive/feedback-YYYY-MM.md`).

## Por que isso existe
1. Capturar dívida invisível: o agente que sabe que está com .md desatualizado é a melhor fonte para apontar.
2. Permitir evolução incremental do time — cada TASK gera dado de melhoria.
3. Dar ao usuário um canal direto, sem filtragem do orquestrador, para entender o estado real do time.
4. Forçar Viktor a olhar criticamente para si e para o time, não só pra entregar a feature.

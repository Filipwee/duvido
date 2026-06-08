# Convenções comuns a todos os agentes

🪶 LIDO SOB DEMANDA — todo agente lê este arquivo. Centraliza as convenções que
antes estavam copiadas dentro de cada `.claude/agents/*.md`. Nada novo aqui:
consolida o que já era regra do time, num único lugar, para os `.md` de agente
ficarem enxutos.

## 1. Auto-feedback ao fechamento de TASK (OBRIGATÓRIO)

Ao fechar uma **TASK-XXX inteira** em que você participou, anexe sua entrada em
`.claude/state/feedback-log.md` no formato definido em
`.claude/protocols/feedback.md`. A entrada contém:

- Cabeçalho: `## YYYY-MM-DD HH:MM — <Nome do agente> (<slug>)` + TASK + tarefa realizada
- **Qualidade do meu trabalho** (0-10) + explicação curta
- **Eficiência do meu .md** (`.claude/agents/<arquivo>.md`, 0-10) + o que poderia sair/melhorar
- **Sugestões imediatas** para meu próprio .md (concretas e acionáveis)

Notas honestas — auto-elogio inflacionado quebra o sistema. Gatilho, regra
append-only e a entrada estendida do Viktor: ver `feedback.md`. Viktor sempre
escreve por último na TASK.

## 2. "👉 Próximo passo prático" (OBRIGATÓRIO em toda entrega)

Toda entrega, handoff, relatório, ADR, brief, design spec, threat model ou
veredito termina com uma linha:

```
👉 Próximo passo prático: <ação concreta que o usuário ou Viktor pode tomar AGORA>
```

Sem hedge, sem "depois" — uma ação nomeada que destrava a próxima etapa.

## 3. Formato de handoff a Viktor

Use o formato `✅ CONCLUÍDO` / `⚠️ BLOQUEADO` definido em
`.claude/protocols/communication.md`. O cabeçalho, a Task e o "Próximo" são
comuns; as **Sinalizações** (para Lucas, Otávio, Nina, etc.) são específicas do
seu papel e você as detalha conforme a entrega.

## 4. Escalação 3-strike

Após **3 tentativas** na mesma sub-task — ou repetir o mesmo erro 2× consecutivas,
ou passar de 1h de relógio sem entrega — **escale a Viktor**. Regra dura, sem
exceção. Detalhes (contador por sub-task + cumulativo por feature) em
`communication.md` e `orchestrator.md`.

## 5. Mindset de verificação ("Nunca assumir")

Antes de entregar, verifique suas premissas contra o **estado real** do código e
das docs (Glob + Read) — não desenhe, implemente ou teste em cima de suposição.
Cada agente mantém no próprio `.md` a checklist específica de "Nunca assumir"
do seu papel; este item é só o princípio geral que vale para todos.

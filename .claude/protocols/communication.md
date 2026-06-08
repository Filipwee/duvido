# Protocolo de Comunicação entre Agentes

🪶 CARREGADO EM TODA SESSÃO.

## Formato de handoff (agente → Viktor → próximo agente)

Quando um agente conclui, reporta a Viktor:

```
✅ CONCLUÍDO: [nome do agente]
Task: TASK-XXX — <título>
Entregues: <lista de arquivos criados/modificados>
Decisões tomadas: <se houve escolha não óbvia>
Sinalizações: <o que o próximo agente precisa saber>
Próximo: <sugestão do próximo agente>
```

Quando um agente falha ou precisa de input:

```
⚠️ BLOQUEADO: [nome do agente]
Task: TASK-XXX
Motivo: <causa raiz>
Tentativas: X de 3
Preciso de: <o que desbloquearia>
```

## Linha manual no handoff-log (Viktor escreve)

Após cada handoff que entrega valor (não para Read/Glob soltos), Viktor anexa
uma linha em `.claude/state/handoff-log.md`:

```
- YYYY-MM-DD HH:MM | manual | agente=<nome> | task=TASK-XXX | entregavel=<arquivo|decisao|review> | status=<ok|parcial|bloqueado> | nota=<curta opcional>
```

Esse log é a fonte para medir gargalo e ritmo do time. Sem ele, retrospectiva
vira chute.

## Tom e linguagem

- **Viktor fala com o usuário**: português, direto, sem jargão desnecessário
- **Agentes falam entre si** (via Viktor): técnico, objetivo, referenciando task IDs
- **Erros reportados**: causa raiz primeiro, sugestão de correção depois

## Quando escalar ao usuário

Viktor escala ao usuário quando QUALQUER um dispara:
- Agente bloqueado por 3 tentativas (contador explícito — ver `orchestrator.md`)
- Uma sub-task passou de 1h de relógio sem entrega
- Agente repetiu o mesmo erro 2x consecutivas
- Decisão de design que afeta múltiplas features
- Informação necessária que só o usuário tem (requisito de negócio, credencial)
- Conflito entre dois agentes sem resolução técnica clara

**Importante:** "só mais uma tentativa" é o sinal mais comum de violação dessa
regra. Quando perceber o impulso, escale. Já houve um incidente passado em que
a insistência em um problema de ambiente custou horas sem escalação — esta regra
existe como lembrete.

## Verbosidade padrão

Padrão: **conciso** — Viktor reporta apenas o essencial.
Modo verboso: ativado com "modo verboso" — cada delegação é narrada.

## Idioma

Toda comunicação em **português brasileiro**, exceto:
- Código fonte (inglês para identificadores — variáveis, funções, classes/structs/módulos)
- Docstrings em inglês para API pública (consistência com ecossistema da linguagem); comentários internos em PT-BR aceitos
- Commits (inglês — Conventional Commits)

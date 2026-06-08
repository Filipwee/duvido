# Postmortems

Análise blameless de incidentes — linha do tempo, causa raiz (5 Whys), lições aprendidas, ações corretivas. Autor: **Viktor** (com input de todos os agentes que tocaram a feature).

## Quando criar um Postmortem
- Incidente em produção (vazamento, indisponibilidade, dado corrompido)
- Bug que escapou ao review e foi descoberto em staging/prod
- Feature entregue que precisou ser revertida
- Decisão de processo/arquitetura que mostrou consequência negativa não prevista

## Quando NÃO criar
- Build vermelho local (é só erro de desenvolvimento)
- Bug encontrado no review (review está fazendo seu papel)
- Discordância de design / decisão que ainda não foi tomada

## Formato
Ver `.claude/protocols/ceremonies.md` — seção "Postmortem".

## Nomenclatura
`PM-NNN-<slug-curto>.md` — NNN sequencial começando em 001.

## Índice
Iris linka todos os postmortems em `.claude/context/architecture.md` na seção "Postmortems".

## Princípio fundamental — BLAMELESS
Foco em **sistema que permitiu o erro**, não em quem cometeu. Erro de uma
pessoa que poderia ter sido evitado por processo é problema de processo.

## Severidade
`Crítico` (perda de dado, vazamento, downtime de horas) | `Alto` (impacto a 1+ usuário, requer hotfix) | `Médio` (degradação, workaround disponível)

## Saída obrigatória
Toda postmortem tem **ações corretivas com responsável e prazo** — sem isso, é só lamento.

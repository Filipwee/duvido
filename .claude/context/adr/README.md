# Architecture Decision Records (ADR)

Decisões arquiteturais formais do projeto. Autor: **Sergio** (Tech Lead + Architect).

## Quando criar um ADR
Decisão técnica que **sobrevive à feature atual** — vai pautar as próximas 5+ features:
- Estilo arquitetural (monolito modular, hexagonal etc.)
- Stack ou padrão transversal (auth, persistência, erro, teste)
- Escolha entre opções com custo de reverter alto (sync vs async, REST vs eventos)
- Mudança de padrão já estabelecido (substitui ADR anterior)

## Quando NÃO criar
- Microdecisão local (qual nome de método, qual exceção lançar) — fica no código
- Padrão usado uma vez sem repetição prevista
- Decisão de produto (vai pra `briefs/`)
- Decisão de design (vai pra `design/`)

## Formato
Ver `.claude/rules/templates/adr-template.md` — formato completo (autoria: Sergio/architect).
Scaffold copiável enxuto: `ADR-000-template.md` nesta pasta.

## Nomenclatura
`ADR-NNN-<slug-curto>.md` — NNN sequencial começando em 001.

## Índice
Iris linka todos os ADRs em `.claude/context/architecture.md` na seção "Índice de decisões → ADRs".

## Status válidos
`proposto` | `aceito` | `substituído por ADR-MMM` | `revogado`

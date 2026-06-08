# Design Specs

Especificações de UX/UI — fluxo, wireframe textual, hierarquia visual, estados, acessibilidade, microcopy. Autora: **Helena** (UX/UI Designer).

## Quando criar uma Design Spec
- Tela nova
- Mudança de fluxo em tela existente
- Componente novo no design system
- Reclamação de UX que vira melhoria estrutural

## Quando NÃO criar
- Ajuste de estilo local (Renata + Otávio)
- Bug visual (padding, alinhamento)
- Componente shadcn/ui sem customização

## Formato
Ver `.claude/rules/templates/design-spec-template.md` — formato completo + spec curta (autoria: Helena/designer).

## Nomenclatura
`DS-NNN-<slug-curto>.md` — NNN sequencial começando em 001.

## Índice
Iris linka todas as specs em `.claude/context/architecture.md` na seção "Design Specs".

## Status válidos
`rascunho` | `aprovado` | `em-implementação` | `entregue`

## Princípio
**Fluxo antes de pixel.** Spec textual + wireframe ASCII + referência a shadcn/ui é suficiente — não usa Figma neste projeto.

## Os 4 estados obrigatórios
Toda spec cobre: **padrão** (happy path) + **vazio** (sem dados) + **loading** + **erro**. Falta de um deles é motivo de veto da Helena.

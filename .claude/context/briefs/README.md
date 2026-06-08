# Product Briefs

Briefs de produto — traduzem pedido do usuário em requisito verificável. Autora: **Olivia** (Product Manager).

## Quando criar um Brief
- Pedido novo do usuário em linguagem solta ("quero uma tela de X")
- Sintoma sem requisito ("está lento", "não funciona")
- Pedido com solução pronta — Olivia avalia se resolve o problema real
- Antes de **qualquer** planejamento por Petra

## Quando NÃO criar
- Bug fix com causa raiz clara
- Refactor interno sem impacto em usuário
- Build / CI / dependência
- Pedido sem dimensão de produto

## Formato
Ver `.claude/rules/templates/product-brief-template.md` — formato completo + brief curto (autoria: Olivia/product-manager).

## Nomenclatura
`PB-NNN-<slug-curto>.md` — NNN sequencial começando em 001.

## Índice
Iris linka todos os briefs em `.claude/context/architecture.md` na seção "Product Briefs".

## Status válidos
`rascunho` | `aprovado` | `em-implementação` | `entregue` | `descartado`

## Princípio
**Outcome > Output.** Brief mede o que muda na vida do usuário, não a quantidade de tela entregue.

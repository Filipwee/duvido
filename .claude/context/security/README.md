# Threat Models

Modelagem de ameaças por feature/área — análise STRIDE, classificação de risco, mitigações exigidas. Autora: **Nina** (Security Engineer).

## Quando criar um Threat Model
- Feature toca autenticação, autorização, sessão
- Feature persiste PII (CPF, e-mail, telefone, dado financeiro, saúde)
- Feature usa secret novo (token, API key, certificado)
- Feature integra com sistema externo (em paralelo a relatório da Diana)
- Feature exposta a input externo (formulário, upload, query string)
- Dependência nova em `pom.xml` ou `package.json` (supply chain)

## Quando NÃO criar
- Refactor interno sem mudança de superficie de ataque
- Mudança cosmética de UI sem dado
- Bug fix sem implicação de segurança

## Formato
Ver `.claude/rules/templates/threat-model-template.md` — formato completo + TM curto (autoria: Nina/security).

## Nomenclatura
`TM-NNN-<slug-curto>.md` — NNN sequencial começando em 001.

## Índice
Iris linka todos os TMs em `.claude/context/architecture.md` na seção "Threat Models".

## Status válidos
`rascunho` | `aprovado` | `mitigado` | `aceito-como-dívida`

## Veto de Nina
Risco **Crítico ou Alto não mitigado** bloqueia merge — sobrescreve approval de Otávio. Aceite consciente exige aprovação do usuário.

## Princípio
**Risco = probabilidade × impacto.** Classificação honesta, não paranoia.

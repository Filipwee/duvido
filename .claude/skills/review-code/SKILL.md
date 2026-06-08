---
name: review-code
description: Revisão de código no stack ativo do projeto. Aciona Otávio sempre, e Sofia se faltar testes. Use quando o usuário pede revisão de código ou antes de qualquer merge.
---

# Review Code

## Passo a passo

### 1. Levantar o que revisar
Se não especificado: `git diff origin/main...HEAD -- src/`

### 2. Acionar Otávio (reviewer) SEMPRE
Briefing inclui: arquivos modificados + contexto da task.
Otávio devolve: veredito + lista de achados classificados.

### 3. Verificar cobertura de testes
Se Otávio apontar testes faltando → aciona Sofia para gerar.
Sofia roda o comando de teste do stack ativo para confirmar que passam.

### 4. Se houver bloqueador
Viktor aciona Lucas para corrigir.
Depois: Max roda build, Otávio re-revisa ponto específico.

### 5. Reportar ao usuário
- Veredito: APROVADO | APROVADO COM RESSALVAS | BLOQUEADO
- Lista de achados por severidade
- O que foi corrigido (se houve)

## Critério de pronto
- [ ] Otávio emitiu veredito
- [ ] Sofia verificou cobertura (se necessário)
- [ ] Bloqueadores corrigidos (se havia)
- [ ] Usuário recebeu relatório

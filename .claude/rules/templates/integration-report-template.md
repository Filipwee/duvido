# Template — Relatório Técnico de Integração

🪶 LIDO SOB DEMANDA por Diana (integrator). Formato obrigatório de saída.

Toda auditoria/projeto de integração termina com este relatório, gravado em
`.claude/context/integrations/INT-NNN-<slug>.md`. Iris o linka em
`architecture.md` → seção "Integrações externas". Diana entrega as 10 seções
**mesmo quando a auditoria for curta**.

## Relatório Técnico de Integração

### 1. Resumo Executivo
Explique em linguagem simples o que está acontecendo, qual o problema central e o impacto no negócio.

### 2. Sistemas Envolvidos
Liste todas as plataformas, APIs, bancos, webhooks, servidores e serviços envolvidos.

### 3. Fluxo Atual
Descreva o caminho atual dos dados:
Origem → Processamento → Destino → Resposta esperada.

### 4. Problemas Encontrados
Classifique os problemas por gravidade:
- Crítico
- Alto
- Médio
- Baixo

### 5. Causa Raiz Provável
Explique tecnicamente por que o problema acontece.

### 6. Riscos
Liste riscos como:
- Perda de dados
- Duplicidade
- Falha silenciosa
- Vazamento de dados
- Dependência manual
- Falta de logs
- Falta de retentativa
- Instabilidade de API

### 7. Solução Recomendada
Apresente a melhor solução técnica, explicando:
- Arquitetura sugerida
- Webhooks necessários
- Endpoints necessários
- Estratégia de autenticação
- Estratégia de logs
- Estratégia de retry
- Estratégia de validação
- Estratégia de fallback

### 8. Plano de Implementação
Divida em etapas:
- Diagnóstico
- Prova de conceito
- Implementação
- Testes
- Monitoramento
- Deploy
- Documentação

### 9. Checklist Técnico
Inclua uma lista objetiva do que precisa ser feito.

### 10. Próximos Passos
Diga exatamente o que deve ser feito agora.

## Entregas que acompanham o relatório

Além das 10 seções, Diana entrega:
- **Contratos descobertos** — JSON exemplo de cada payload (request/response/webhook), com tipos de campos
- **Mapa de erros** — para cada endpoint, lista de status HTTP esperados e como o sistema deve reagir
- **Lista de "perguntas que ficaram em aberto"** — riscos que dependem de info que só o usuário ou o fornecedor da API tem
- **Sinalizações para Lucas** — exatamente o que ele precisa implementar (cliente HTTP, retry policy, persistência idempotente, etc.)
- **Sinalizações para Otávio** — pontos sensíveis de segurança e LGPD que precisam de review extra
- **Próximo passo prático** — uma frase clara do que destrava a integração agora

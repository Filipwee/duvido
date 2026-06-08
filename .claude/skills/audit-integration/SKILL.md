---
name: audit-integration
description: Auditoria técnica de integração com sistema externo (API, webhook, fila, OAuth, gateway de pagamento, CRM/ERP, WhatsApp, e-mail, scraping). Aciona Diana para investigar, mapear contratos reais, identificar riscos e entregar relatório técnico de 10 seções + plano de implementação. Use quando o pedido envolve sistema externo OU quando aparece sintoma de "às vezes funciona", "dado não chegou", "duplicou", "timeout intermitente", "401 aleatório".
---

# Audit Integration

## Passo a passo

### 1. Levantar contexto da integração
Viktor pergunta (se não estiver claro):
- Qual sistema externo está envolvido?
- O fluxo é entrada (recebemos) ou saída (enviamos)?
- Já existe código tentando essa integração ou é greenfield?
- Existe documentação oficial? Onde?
- Existe acesso a ambiente sandbox? Credenciais disponíveis?
- Qual o impacto se essa integração falhar silenciosamente?

### 2. Acionar Diana (integrator)
Briefing inclui: nome do sistema, fluxo, código existente (se houver), documentação disponível, sintoma observado (se for diagnóstico).

Diana executa as 7 etapas do seu comportamento:
1. Entender fluxo real do negócio
2. Auditar tecnicamente
3. Produzir relatório (10 seções)
4. Pensar como engenheiro sênior
5. Nunca assumir que API funciona
6. Investigar quando faltar documentação
7. Responder no padrão: diagnóstico → hipóteses → solução → checklist → riscos → próximo passo

### 3. Avaliar resultado da auditoria
Diana devolve:
- **Relatório Técnico de Integração** (10 seções)
- Contratos JSON descobertos
- Mapa de erros HTTP
- Perguntas em aberto (dependem do usuário ou fornecedor)
- Sinalizações para Lucas/Renata/Otávio
- Próximo passo prático

Viktor avalia se a auditoria é suficiente para destravar implementação ou se precisa de:
- Decisão do usuário (acesso, credencial, escopo)
- Spike adicional (POC para validar hipótese)
- Replanejamento (Petra divide em N tasks)

### 4. Roteamento conforme resultado
- Auditoria entregou contrato pronto → **Petra** monta plano de implementação (Lucas + Renata + Sofia)
- Auditoria revelou problema sem código nosso → relatório vai para usuário decidir (escopo aumentou)
- Auditoria revelou bug em código existente → **Lucas** corrige com guia de Diana
- Auditoria revelou que a integração proposta é inviável → **registrar decisão** em `decisions.md` e escalar

### 5. Registrar contrato em memória
Sempre que Diana descobrir um contrato novo, **Iris** registra em `memory/decisions.md` com:
- Sistema externo
- Versão da API auditada
- Endpoints + payloads exemplo
- Limites conhecidos (rate limit, tamanho de payload, latência)
- Idiossincrasias descobertas (campos opcionais que vêm null vs ausentes, etc.)

Assim, na próxima integração com o mesmo sistema, ninguém audita do zero.

### 6. Reportar ao usuário
- Resumo executivo (1–2 parágrafos)
- Os 4 riscos mais críticos
- Próximo passo prático
- Link para o relatório completo (caminho do arquivo se Diana salvou)

## Critério de pronto
- [ ] Diana entregou o Relatório Técnico de Integração (10 seções)
- [ ] Contratos descobertos estão documentados em JSON
- [ ] Riscos foram classificados (Crítico/Alto/Médio/Baixo)
- [ ] Próximo passo prático está claro
- [ ] Decisão de Viktor sobre roteamento foi reportada ao usuário
- [ ] Se virou implementação: Petra recebeu briefing para o plano
- [ ] Iris registrou o contrato em `memory/decisions.md` (para reuso futuro)

## Anti-padrões que esta skill evita
- Lucas implementando integração com contrato inventado (sem Diana auditar antes)
- "Vamos só tentar e ver o que acontece" (sem mapear erros e riscos primeiro)
- Implementar sem idempotência em fluxo que pode duplicar
- Aceitar "às vezes funciona" como estado normal
- Logar payload completo com PII (Diana audita LGPD)

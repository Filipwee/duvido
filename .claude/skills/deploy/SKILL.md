---
name: deploy
description: Leva um artefato a produção com prontidão operacional. Téo (SRE) faz a production readiness review (gate: health check, observabilidade, rollback, migration compatível, secrets de runtime), Max confirma artefato + CI verde, Nina valida segurança de runtime se sensível, Téo executa a estratégia de deploy (canary/blue-green/rolling), observa e reverte se degradar. Use quando o pedido é "fazer deploy", "subir pra produção", "release", "promover", "configurar deploy/rollback".
---

# Deploy

Subir é fácil; subir **com como observar e como voltar** é o trabalho. Esta skill
é o caminho do artefato (entregue por Max) até produção operável (mantida por Téo).

> Pré-requisito: existe artefato buildável + CI verde (ver `/run-build`,
> `/start-java-project`). Sem app rodável e infra-alvo, o deploy é planejado mas
> não executado — Téo entrega o plano de readiness + rollback.

## Argumento esperado
Versão/artefato e ambiente alvo (via $ARGUMENTS). Se vago, Téo pergunta: o que
subir, para onde, e qual a janela.

## Passo a passo (Viktor orquestra)

### 1. Production Readiness Review (Téo) — GATE
Téo verifica antes de qualquer deploy:
- **Health check** (readiness + liveness) existe e responde
- **Observabilidade mínima**: log estruturado com correlation id, métrica de erro/latência, e como visualizar
- **Plano de rollback** viável e testado
- **Migration compatível** com a versão anterior (expand/contract — não quebra durante o deploy)
- **Secrets de runtime** via env/vault, nunca no artefato

Faltou algo → **veto de deploy** de Téo. Endereça (Lucas/Renata implementam health
check/log; Téo monta dashboard/alerta/rollback) antes de seguir.

### 2. Confirmar artefato (Max → Téo)
Max confirma build/CI verde e entrega o artefato/imagem. Handoff explícito Max → Téo.

### 3. Segurança de runtime (Nina) — se sensível
Feature toca auth/PII/secret ou expõe nova superfície → Nina valida hardening de
container, secrets e exposição. Veto de Nina (Crítico/Alto) sobrepõe.

### 4. Executar deploy (Téo)
Téo aplica a estratégia adequada (canary/blue-green/rolling), com a aplicação
sob observação. Feature flag para desacoplar deploy de release quando fizer sentido.

### 5. Verificar saúde pós-deploy (Téo)
- Smoke pós-deploy: caminho crítico responde saudável (não só "subiu")
- Observa erro/latência vs baseline e error budget
- **Degradou → rollback** conforme o plano do passo 1 (sem improviso)

### 6. Documentar e fechar (Iris / Viktor)
- Iris atualiza runbook / seção de operação no README
- Viktor atualiza `dashboard.md` (versão em produção, dívidas operacionais)
- Se algo deu errado e foi mitigado → Postmortem (ver `/diagnose-bug` e `ceremonies.md`)

## Critério de pronto desta skill
- [ ] Readiness review aprovada por Téo (health check + observabilidade + rollback)
- [ ] Artefato + CI verde confirmados por Max
- [ ] Nina aprovou segurança de runtime (se feature sensível)
- [ ] Deploy executado com estratégia definida (ou plano entregue, se não há infra)
- [ ] Smoke pós-deploy saudável; rollback documentado e testado
- [ ] Runbook/README e dashboard atualizados

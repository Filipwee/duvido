---
name: diagnose-bug
description: Investiga um bug até a causa raiz e corrige com teste de regressão. Reproduz com um teste que FALHA (Sofia), rastreia a causa raiz (Lucas/Renata, ou Sergio se sistêmico), aplica fix mínimo, confirma o teste verde + suíte sem regressão (Max), registra a causa em decisions.md e dispara Postmortem se crítico. Use quando aparece "está dando erro", "não funciona", "quebrou", "exceção em produção", "regressão". Se o sintoma é entre sistemas ("dado sumiu entre A e B", "às vezes funciona"), use /audit-integration (Diana).
---

# Diagnose Bug

Disciplina sênior: **reproduzir antes de corrigir, corrigir a causa raiz — não o
sintoma**, e deixar um teste que impede o bug de voltar.

## Argumento esperado
Descrição do bug, como disparar, comportamento esperado vs observado (via
$ARGUMENTS). Se faltar, Viktor pergunta o passo-a-passo de reprodução.

## Passo a passo (Viktor orquestra)

### 0. Roteamento prévio
Se o sintoma é de **integração externa** ("dado não chegou", "duplicou", "401
intermitente", "às vezes funciona") → use `/audit-integration` (Diana) em vez
desta skill. Aqui tratamos bug **dentro** do nosso código.

### 1. Reproduzir com um teste que FALHA (Sofia)
Sofia escreve o menor teste que reproduz o bug e o roda para confirmar que
**falha** (vermelho). Sem reprodução, não há diagnóstico — só palpite.
Se não der pra reproduzir, Viktor escala ao usuário pedindo mais contexto
(logs, payload, passos), respeitando o limite de 3 tentativas.

### 2. Rastrear a causa raiz (Lucas / Renata; Sergio se sistêmico)
- Lucas (backend) / Renata (frontend) lê o caminho do dado e isola a causa.
- Pergunta "por quê?" até a origem — não para no primeiro sintoma.
- Se a causa é **sistêmica** (padrão errado repetido, decisão de arquitetura) → Sergio entra; pode virar ADR.

### 3. Aplicar fix mínimo (Lucas / Renata)
Corrige **a causa**, no menor escopo possível. Sem refactor oportunista junto
(isso é outra task — ver `/refactor-code`). Nina entra se o bug tem implicação
de segurança (auth, vazamento, injeção).

### 4. Confirmar verde + sem regressão (Max)
- O teste do passo 1 agora **passa** (verde).
- A suíte inteira continua verde — o fix não quebrou nada.
- comando de teste do stack ativo (ver `stacks/<active>/build-reference.md`). Loop com Lucas/Renata, máximo 3 ciclos.

### 5. Registrar e fechar (Iris / Viktor)
- Causa raiz documentada em `.claude/memory/decisions.md` (via Iris) — para não repetir.
- Se o bug foi **crítico** (impacto em produção, dado, segurança) → Viktor conduz **Postmortem** (ver `protocols/ceremonies.md` → grava em `context/postmortem/`).
- Otávio revisa o fix + o teste de regressão.

### 6. Reportar ao usuário
- Causa raiz (1-2 frases, não o sintoma)
- Fix aplicado + arquivo:linha
- Teste de regressão adicionado
- Postmortem (se crítico)

## Critério de pronto desta skill
- [ ] Teste que reproduz o bug foi adicionado e **falhava** antes do fix
- [ ] Teste passa após o fix
- [ ] Suíte inteira verde (nenhuma regressão)
- [ ] Causa raiz documentada em `decisions.md`
- [ ] Otávio revisou; Nina revisou se havia implicação de segurança
- [ ] Postmortem criado se o bug era crítico

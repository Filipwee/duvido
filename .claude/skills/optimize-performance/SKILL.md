---
name: optimize-performance
description: Diagnostica e otimiza performance de backend ou frontend no stack ativo do projeto. Mede ANTES de mudar (baseline), identifica o gargalo real com evidência (N+1, query lenta, índice faltando, cache, web vitals, bundle), aciona Sergio se a correção implica decisão arquitetural, implementa com Lucas/Renata e confirma o ganho com Max/Sofia. Use quando aparece "está lento", "demora", "timeout", "alto consumo de memória", "query pesada", "página trava", "LCP/INP ruim".
---

# Optimize Performance

Regra de ouro sênior: **sem medição não há otimização — só achismo.** Mede,
identifica o gargalo com evidência, corrige a causa, mede de novo.

## Argumento esperado
O sintoma e onde dói (endpoint, tela, query) via $ARGUMENTS. Se vago, Viktor
pergunta: o que está lento, em que cenário, com quanto dado.

## Passo a passo (Viktor orquestra)

### 1. Classificar (backend vs frontend) e definir baseline
- **Backend** → Max/Sofia reproduzem e medem: tempo de resposta, nº de queries (SQL log / `spring.jpa.show-sql` + `hibernate.generate_statistics`), p95 sob carga representativa.
- **Frontend** → Renata mede: web vitals (LCP/INP/CLS), tamanho de bundle, nº de renders, waterfall de rede.
- Registra o **número de partida** — sem baseline não dá pra provar ganho.

### 2. Identificar o gargalo com evidência (não chutar)
- Backend (Lucas + Sergio se preciso): N+1 query, falta de índice, fetch eager indevido, falta de paginação, transação longa, serialização cara, ausência de cache. Usa profiling (JFR/async-profiler) quando o gargalo não é óbvio no log.
- Frontend (Renata): re-render desnecessário, falta de memo/virtualização, bundle não dividido, imagem não otimizada, request em cascata.

### 3. Decisão arquitetural? → Sergio (ADR)
Se a correção implica **cache strategy, desnormalização, leitura assíncrona,
read replica, índice que muda o modelo** → Sergio decide e registra ADR. Otimização
pontual (corrigir N+1 com `JOIN FETCH`, adicionar índice óbvio) não precisa de ADR.

### 4. Implementar (Lucas / Renata)
Aplica **uma** mudança por vez, da de maior impacto/menor risco para a menor.
Nina entra se cache/otimização expuser dado sensível ou mudar superfície.

### 5. Medir de novo e travar regressão (Max + Sofia)
- Max/Renata re-medem no mesmo cenário do baseline → comprova o ganho com número.
- Sofia adiciona guarda de regressão quando aplicável (asserção de nº de queries, teste de carga leve, budget de bundle).
- Comportamento funcional inalterado: suíte continua verde.

### 6. Revisar e reportar (Otávio)
Otávio revisa correção e ausência de efeito colateral. Viktor reporta:
baseline → resultado, gargalo encontrado, o que mudou, ganho medido.

## Critério de pronto desta skill
- [ ] Baseline medido e registrado (antes)
- [ ] Gargalo identificado com evidência (não suposição)
- [ ] Correção aplicada (ADR se foi decisão arquitetural)
- [ ] Ganho medido no mesmo cenário (depois) — melhora comprovada por número
- [ ] Sem regressão funcional (testes verdes); guarda de regressão quando cabível
- [ ] Otávio aprovou; Nina aprovou se tocou cache/dado sensível

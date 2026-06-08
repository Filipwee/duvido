---
name: update-context
description: Sincroniza toda a documentação interna após uma entrega ou decisão importante. Aciona Iris para atualizar dashboard, plano, glossário e architecture.md.
---

# Update Context

## Quando usar
- Após feature completa
- Após decisão arquitetural relevante
- Final de sessão longa
- Quando Viktor detecta documentação desatualizada

## Passo a passo

### 1. Acionar Iris (context)
Passa: o que foi entregue + decisões tomadas + novos termos identificados.

### 2. Iris atualiza (nessa ordem)
1. `current-plan.md` — marca tasks como feitas
2. `dashboard.md` — atualiza status e últimas entregas
3. `memory/glossary.md` — adiciona termos novos
4. `memory/decisions.md` — registra decisões informais
5. `context/architecture.md` — se houve mudança estrutural

### 3. Confirmar
Viktor verifica que dashboard está correto.

## Critério de pronto
- [ ] Todas as tasks feitas marcadas no plano
- [ ] Dashboard reflete estado real
- [ ] Glossário atualizado com novos termos

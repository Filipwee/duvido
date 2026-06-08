# Protocolo de Orçamento de Tempo e Contexto

🪶 CARREGADO EM TODA SESSÃO.

## Estimativas de custo por operação

| Operação | Custo de contexto | Agente |
|----------|------------------|--------|
| Ler 1 arquivo de código pequeno (~100 linhas, qualquer linguagem) | Baixo | Qualquer |
| Ler persona de agente | Médio | Viktor (sob demanda) |
| Gerar classe/módulo/arquivo completo no stack ativo | Médio | Lucas |
| Rodar testes do stack ativo e interpretar output | Médio | Max |
| Review completo de feature | Alto | Otávio |
| Refactor de módulo | Alto | Lucas |
| Planejamento de feature nova | Alto | Petra |

## Regras de orçamento

### Sessão normal (maioria dos casos)
- Máximo 3 agentes por task simples
- Máximo 6 agentes por feature completa
- Se passar de 6, dividir em duas tasks

### Sinais de contexto alto
Viktor monitora e age quando:
- Sessão com muitos arquivos grandes carregados → `/compact`
- Mesma informação sendo repetida → consolida em state/
- Agente relendo arquivo que já leu → Iris atualiza memória

## Quando usar `/compact`

- Antes de começar uma nova feature (limpa contexto da anterior)
- Após sessão de debug longa
- Quando Viktor percebe que está repetindo contexto

## Economia de tokens

- Personas carregadas SOB DEMANDA (não todas ao mesmo tempo)
- Wisdom carregado SOB DEMANDA por quem precisa
- `dashboard.md` ≤ 50 linhas (Viktor lê em todo ritual)
- `current-plan.md` ≤ 80 linhas por plano

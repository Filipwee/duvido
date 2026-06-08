---
name: explore-codebase
description: Explora uma codebase desconhecida ou legacy gerando grafo de conhecimento navegável (arquivos, funções, classes, dependências, fluxos de domínio). Aciona Yara (codebase-explorer) que opera o plugin Understand-Anything. Use para onboarding em projeto novo, análise pré-refactor, mapeamento de impacto de PR, visão sistêmica antes de ADR, ou postmortem. Diferente de `/start-project` (que cria projeto NOVO) — esta skill MAPEIA projeto EXISTENTE.
---

# Explore Codebase

Você está mapeando uma **codebase existente** para entender sua estrutura,
relações e fluxos. O fluxo é dirigido pela **Yara (codebase-explorer)** que
opera o plugin **Understand-Anything**, instalado em
`.claude/plugins/understand-anything/`.

> Diferença de `/start-project`: aquela skill **CRIA** um projeto novo do zero.
> Esta skill **ANALISA** um projeto que já existe.

## Argumento esperado
Descrição da exploração. Passada via $ARGUMENTS. Exemplos:
- "preciso entender essa codebase, acabei de entrar no time"
- "vou refatorar o módulo de pagamento, mapeie o que ele toca"
- "PR #142 muda 8 arquivos, qual o impacto?"
- "documentar a arquitetura atual no architecture.md"
- "extrair os fluxos de negócio do código"

## Passo a passo (Viktor executa)

### 1. Classificação do pedido
Viktor decide o tipo de exploração baseado no $ARGUMENTS:

| Tipo | Comando alvo | Quando |
|------|--------------|--------|
| Mapeamento inicial / onboarding | `/understand` + `/understand-onboard` | Codebase nova, dev novo |
| Visualização interativa | `/understand-dashboard` | Já tem grafo, quer navegar |
| Análise de impacto de PR/diff | `/understand-diff` | Antes de merge |
| Deep-dive em alvo específico | `/understand-explain <alvo>` | Compreensão localizada |
| Q&A sobre o código | `/understand-chat` | Perguntas livres |
| Fluxos de negócio | `/understand-domain` | Visão de processo |
| Análise de wiki/KB | `/understand-knowledge` | Não é código — é base de conhecimento |

Se ambíguo, Viktor pergunta ao usuário antes de prosseguir.

### 2. Acionar Yara (codebase-explorer)
Briefing inclui:
- Tipo de exploração (passo 1)
- Caminho alvo (default: `.`)
- Stack ativo do `.claude/project-profile.md` (para Yara cruzar com o detectado)
- Restrições (ex: "rodar incremental", "evitar re-run completo", "linguagem da saída em PT-BR" — usa `--language pt`)

### 3. Yara verifica o estado do grafo
- Se `.understand-anything/knowledge-graph.json` **não existe** → Yara roda `/understand` (pipeline completo). **Avisa o usuário** que pode levar tempo.
- Se existe e está **sincronizado** (commit hash bate) → Yara vai direto ao deep-dive
- Se existe mas está **stale** → Yara propõe `/understand --auto-update` (incremental, rápido)

### 4. Yara opera o plugin
Conforme o tipo do passo 1, Yara executa o comando correspondente e
interpreta a saída.

### 5. Diálogos laterais (se aplicável)
Yara pode dialogar lateralmente com:
- **Sergio (Architect)** — se detectar pontos de atenção arquitetural (ciclos, acoplamento alto, módulos órfãos)
- **Iris (Tech Writer)** — para atualizar `architecture.md` com diagrama derivado do grafo
- **Otávio (Reviewer)** — em análise de impacto pré-merge

### 6. Entrega ao usuário
Yara entrega no formato padrão (ver `.claude/agents/codebase-explorer.md` → Output obrigatório).

### 7. Atualizar estado do projeto
- Iris (se acionada) atualiza `architecture.md` referenciando o grafo
- Se grafo virou commitable: adicionar `.understand-anything/knowledge-graph.json` (não o diretório inteiro — só esse arquivo + `config.json` + `meta.json`) ao próximo commit

## Critério de pronto

- [ ] Pergunta motivadora respondida com referência a nós/edges reais do grafo
- [ ] Estado do grafo verificado (existe, atualizado, sincronizado com HEAD)
- [ ] Stack detectado bate com `project-profile.md` (ou divergência reportada)
- [ ] Próximo passo prático identificado (ADR, refactor, merge, docs, etc.)
- [ ] Se gerou grafo novo: usuário informado de como visualizar (`/understand-dashboard`)

## Reportar ao usuário

- Tipo de exploração executada
- Comando do plugin que rodou
- Resumo dos achados (em linguagem natural — Yara já formatou)
- Próximos comandos sugeridos (`/understand-dashboard`, `/understand-explain X`, etc.)
- Se virou input para outro agente: qual e por quê

## Casos especiais

### Codebase muito grande (>50k arquivos)
Yara avisa o usuário do custo (tokens + tempo). Pergunta se quer:
- Rodar mesmo assim (analisar tudo)
- Limitar via `.understandignore`
- Analisar só um subdir (`/understand path/to/subdir`)

### Stack detectado diverge de `project-profile.md`
Yara reporta a Viktor. Viktor decide:
- Atualizar `project-profile.md` (se o detectado é correto)
- Investigar com Sergio (se algo no projeto está fora do esperado)

### Saída em outro idioma
Para entregar grafo em português brasileiro:
```
/understand --language pt-BR
```
A flag `--language` afeta summaries, descrições, tags e tour. Default é `en`.

### Grafo commitable (para o time)
Para times que querem o grafo como parte do repo:
```bash
git add .understand-anything/knowledge-graph.json .understand-anything/config.json .understand-anything/meta.json
git commit -m "docs(architecture): atualizar grafo de conhecimento"
```
NÃO commitar `intermediate/` nem `diff-overlay.json` (locais).

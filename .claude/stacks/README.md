# `.claude/stacks/` — Adaptadores de linguagem

Cada subpasta é um **stack** plugável. Os agentes técnicos (Lucas, Renata,
Bruno, Max, Sofia, Otávio) lêem o stack ativo definido em
`.claude/project-profile.md` para saber **como** implementar com profundidade
sênior na linguagem certa.

## Anatomia de um stack

Todo stack contém 8 arquivos. Os nomes são **fixos** — os agentes referenciam
por nome, não por convenção do criador do stack.

```
.claude/stacks/<nome>/
├── README.md                  ← visão geral + quando usar este stack
├── language-rules.md          ← convenções de linguagem (versão, idioms, lints)
├── patterns.md                ← padrões idiomáticos (Repository, Hook, etc.)
├── anti-patterns.md           ← o que NÃO fazer (footguns específicos)
├── skeletons.md               ← skeletons de código obrigatórios
├── test-skeletons.md          ← skeletons de teste no framework do stack
├── build-reference.md         ← comandos build/test/lint + erros comuns
└── scaffold-reference.md      ← estrutura inicial + dependências base
```

## Quem lê o quê (mapeamento agente → arquivo do stack)

| Agente | Arquivos que lê | Quando |
|---|---|---|
| **Bruno** (scaffolder) | `scaffold-reference.md`, `language-rules.md` | Ao montar estrutura inicial / módulo novo |
| **Lucas** (backend coder) | `language-rules.md`, `patterns.md`, `anti-patterns.md`, `skeletons.md` | Antes de toda implementação |
| **Renata** (frontend coder) | mesma coisa, mas no stack frontend ativo | Antes de toda implementação |
| **Sofia** (tester) | `test-skeletons.md`, `language-rules.md` | Antes de escrever testes |
| **Max** (build) | `build-reference.md` | Ao rodar build/test/lint |
| **Otávio** (reviewer) | `patterns.md`, `anti-patterns.md`, `language-rules.md` | Em todo code review |
| **Sergio** (architect) | `language-rules.md`, `patterns.md` (rápido — para contextualizar ADR) | Ao redigir ADR |

> Iris, Olivia, Helena, Nina, Petra, Diana, Téo, Viktor são **agnósticos de
> stack** — não leem essas pastas. Sua área (produto, design, segurança,
> processo, etc.) é independente da linguagem.

## Como criar um stack novo

1. Copie `_template/`:

   ```bash
   cp -r .claude/stacks/_template .claude/stacks/<nome-novo>
   ```

2. Edite os 7 arquivos seguindo as **âncoras** que o `_template` traz em cada
   arquivo (seções obrigatórias, mínimos esperados). Não invente seções —
   os agentes esperam encontrar conteúdo nos lugares certos.

3. Adicione o nome do stack em `.claude/project-profile.md` →
   `active_stacks:`.

4. (Opcional) Suba um Pull Request — stacks de referência são contribuições
   bem-vindas.

### Atalho: deixar o time gerar o stack para você

Se você não quer escrever os 7 arquivos à mão e tem **exemplos canônicos**
do código que o time produzirá (1 controller, 1 service, 1 teste, comandos
de build), Viktor consegue orquestrar Sergio + Sofia + Max para preencher
o stack a partir dos seus exemplos em uma sessão (~15 min de trabalho do
time). Basta pedir: *"Crie o stack `<linguagem>` baseado neste exemplo: …"*.

## Stacks de referência inclusos nesta instalação

| Pasta | Linguagem / Framework | Build / Test |
|---|---|---|
| `java-spring` | Java 17+ / Spring Boot 3.x | Maven / JUnit + Mockito + AssertJ |
| `typescript-react` | TypeScript / React 18+ (SPA com Vite) | Vite / Vitest + RTL |
| `nextjs` | TypeScript / Next.js 15+ (App Router, full-stack) | Next / Vitest + RTL + Playwright |
| `python-fastapi` | Python 3.11+ / FastAPI | Poetry ou uv / pytest |
| `node-typescript` | Node 20+ / Express ou Fastify | npm / Vitest ou Jest |
| `go` | Go 1.22+ / stdlib net/http | go build / go test |
| `_template` | **N/A** — base para criar stacks novos | — |

## Regras invioláveis para stacks

- **Não duplique conteúdo entre stacks** — princípios universais ficam em
  `rules/wisdom/`. Stack só tem o que é específico da linguagem/framework.
- **Não force prática que não pertence à comunidade da linguagem**
  (ex.: não force "interface obrigatória" em Go onde idiomático é não usar).
- **Mantenha o stack enxuto** — alvo: ~150-300 linhas por arquivo. Mais que
  isso vira tutorial; tutorial fica em link externo.
- **Use exemplos realistas, não acadêmicos** — código que poderia entrar em
  produção, não toy examples.
- **Cite a fonte canônica da comunidade** quando relevante (PEP, JEP, RFC,
  guia oficial) — o stack é a destilação, não a fonte.

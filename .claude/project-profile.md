# Project Profile

🪶 CARREGADO EM TODA SESSÃO. É a **fonte de verdade do stack do projeto**.
Viktor lê primeiro; agentes técnicos (Lucas, Renata, Bruno, Max, Sofia, Otávio)
usam este arquivo para decidir qual `.claude/stacks/<nome>/` carregar.

> **Como usar:** preencha os campos abaixo no primeiro dia do projeto. Se
> mudar de stack mais tarde, atualize este arquivo — os agentes se ajustam
> automaticamente, sem precisar mexer em persona.

> **Não sabe o stack ainda?** Deixe `active_stacks: []`. No primeiro pedido
> técnico, Viktor conduzirá um mini-Discovery (Olivia + Sergio) para definir
> a stack antes de qualquer código.

> **⚙️ Pré-configurado para o projeto "Jogo do Duvido"** (Next.js 15 App Router,
> client-side only, deploy Vercel). Se for usar este orquestrador em **outro
> projeto**, edite os blocos `yaml` abaixo (`project_name`, `active_stacks`,
> `paths`, `deploy.target`, etc.) — os agentes se adaptam automaticamente.

---

## Identificação

```yaml
project_name: jogo-do-duvido
project_kind: web
profile_mode: prototype                # mude para 'production' quando estabilizar
languages: [typescript]
```

## Stacks ativos

Stack ativo = pasta em `.claude/stacks/<nome>/` que os agentes lêem ao escrever
código. Pode haver mais de um (ex: back + front). Ordem importa: o primeiro é
o "principal".

```yaml
active_stacks:
  - nextjs                              # Next.js 15+ App Router, client-side only
```

**Stacks disponíveis nesta instalação** (veja `.claude/stacks/`):
- `java-spring` — Java 17+ / Spring Boot 3.x / Maven / JUnit + Mockito + AssertJ
- `typescript-react` — TypeScript / React 18+ / Vite / TanStack Query / Vitest + RTL (SPA)
- `nextjs` — TypeScript / Next.js 15+ (App Router) / React 19+ / Vitest + Playwright (full-stack web)
- `python-fastapi` — Python 3.11+ / FastAPI / Poetry|uv / pytest
- `node-typescript` — Node 20+ / Express|Fastify / TypeScript / Vitest|Jest
- `go` — Go 1.22+ / stdlib net/http / go test
- `_template` — **NÃO usar como ativo** — copie para criar stack novo

## Comandos do projeto (resolvidos do stack ativo)

Estes campos são **opcionais** e servem para sobrescrever defaults do stack.
Quando vazios, agentes leem do `.claude/stacks/<active>/build-reference.md`.

```yaml
commands:
  install: npm install
  build:   npm run build
  test:    npm run test -- --run
  lint:    npm run lint
  run_dev: npm run dev
```

## Diretórios convencionados

```yaml
paths:
  backend_root: src/app                  # Route Handlers e Server Actions vivem aqui
  frontend_root: src                     # raiz do código Next (App Router em src/app)
  tests_root: src                        # testes ao lado do código (*.test.ts/tsx) + e2e/
  docs_root: docs
```

## Convenções de domínio

```yaml
api:
  versioning: none                       # client-side only; sem API pública
  error_format: custom                   # objetos { ok: boolean, errors? } nas Server Actions
  pagination: none
  auth: none                             # jogo client-side, 1 device
data:
  id_strategy: uuid                      # crypto.randomUUID() no client
  monetary_type: string-decimal          # se houver placar/pontuação numérica
  date_format: iso-8601-utc
```

## Plataforma alvo

```yaml
platform:
  os_dev: mixed                          # ajuste conforme seu ambiente
  os_prod: container                     # Vercel/Cloudflare/container Node
  container: none                        # Vercel cuida; ou docker se self-hosted
  ci: github-actions
```

## Deploy alvo (informativo — Téo opera)

```yaml
deploy:
  target: vercel                         # alternativas: cloudflare-pages | self-hosted-node | static-export
  preview: pull-request                  # cada PR gera preview URL
  prod_branch: main
```

---

## Auto-detecção (preenchimento inicial)

Se este arquivo está com placeholders e Viktor está iniciando uma sessão,
o hook `session-start.sh` tenta detectar automaticamente:

| Sinal encontrado no repo | Sugere stack |
|---|---|
| `pom.xml` ou `build.gradle` | `java-spring` |
| `package.json` com `next` em deps | `nextjs` |
| `package.json` com `react` (sem `next`) | `typescript-react` |
| `package.json` sem react/next | `node-typescript` |
| `pyproject.toml` ou `requirements.txt` | `python-fastapi` |
| `go.mod` | `go` |
| `Cargo.toml` | precisa criar stack `rust` |
| `*.csproj` | precisa criar stack `csharp-dotnet` |
| `Gemfile` | precisa criar stack `ruby` |
| `composer.json` | precisa criar stack `php` |

A detecção é **sugestão**, não decisão. Viktor confirma com o usuário no
primeiro turno antes de tratar como verdade.

## Quando NÃO existe stack para a linguagem do projeto

Se a linguagem não está coberta:
1. Viktor avisa: "Não há stack para `<linguagem>`. Posso operar com princípios universais (`rules/wisdom/`) e ir aprendendo via diálogo — mas a qualidade técnica do código será proporcional ao que conseguirmos formalizar."
2. Opções oferecidas ao usuário:
   - **a)** Gerar stack agora (Sergio + Sofia + Max colaboram para preencher `.claude/stacks/<nova>/` em ~10 min de trabalho do time)
   - **b)** Seguir sem stack, com a ressalva de qualidade
   - **c)** Trocar para uma linguagem coberta
3. Se (a): o usuário fornece exemplos canônicos (uma classe/módulo de referência, um teste, comandos de build) e Sergio + Sofia + Max produzem o stack baseado nisso.

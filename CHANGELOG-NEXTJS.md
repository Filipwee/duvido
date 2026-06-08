# Changelog — versão nextjs

Mudanças aplicadas sobre `multiv2comua` (versão original do orquestrador) para
adicionar suporte a Next.js como stack de primeira classe.

## Adicionado

### Stack novo: `.claude/stacks/nextjs/`

Stack completo seguindo o padrão dos 8 arquivos:

- `README.md` — visão geral, quando usar (full-stack web com SSR/SSG/Server Actions), quando NÃO usar (SPA pura → `typescript-react`; backend pesado → stack backend dedicado)
- `language-rules.md` — TS strict, Server vs Client Components, `"use server"` / `"use client"`, App Router (params como Promise no Next 15+), Route Handlers, Server Actions, `next/link`, `next/image`, env vars (`NEXT_PUBLIC_` prefix), diferenças vs Vite+React
- `patterns.md` — Server-first, composição Server→Client com children, `loading.tsx` e `error.tsx`, streaming com Suspense granular, `revalidatePath`/`revalidateTag`, `cache()` do React, `useActionState`, quando usar TanStack Query, middleware, metadata dinâmica, anti-padrões frequentes
- `anti-patterns.md` — `"use client"` na raiz, importar server em client (e mitigação com `import "server-only"`), `useEffect` para data fetching, `revalidatePath("/")` blanket, mutação sem revalidar, auth só no client, Route Handler para form interno, Server Action sem Zod, `<a>` vs `<Link>`, `<img>` vs `<Image>`, middleware com lógica pesada, `redirect()` em try/catch
- `skeletons.md` — root layout, Server Component que busca dados, dynamic route com `params`, `loading.tsx`/`error.tsx`, query layer server-only, Server Actions com Zod, form com `useActionState`, Route Handler, middleware, cliente DB com `import "server-only"`, env tipada com Zod, componente Tailwind `cn()`, Zustand store, tipos do domínio
- `test-skeletons.md` — Vitest + RTL para client, mock de Server Actions e Route Handlers, MSW para client com TanStack Query, Playwright para E2E (preferido sobre testar Server Components diretamente), cobertura mínima por camada
- `build-reference.md` — comandos (npm run dev/build/start, --turbo, ANALYZE), erros TS/Next mais comuns e quem corrige, problemas de ambiente (Windows, memória, hot reload), opções de deploy (Vercel canônico, Cloudflare Pages com adapter, self-hosted), bundle budget alvo, formato do build report
- `scaffold-reference.md` — estrutura completa de pastas, `package.json` (deps core + por feature), comandos de scaffold (`create-next-app`, `shadcn`, Vitest, Playwright), configs base (`tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`), `.env.example`, `.gitignore`, `.gitattributes`

## Modificado

### `CLAUDE.md` (raiz)
- Adicionada linha de `nextjs` na lista de stacks de referência inclusos

### `.claude/project-profile.md`
- Lista de stacks disponíveis agora inclui `nextjs`
- **Pré-preenchido** para o projeto "Jogo do Duvido" (Next.js client-side, deploy Vercel) com banner indicando como adaptar para outros projetos
- Tabela de auto-detecção agora distingue `package.json` com `next` (→ `nextjs`) de `package.json` só com `react` (→ `typescript-react`)
- Adicionada seção `deploy:` com target, branch de prod e estratégia de preview

### `.claude/stacks/README.md`
- Tabela "Stacks de referência inclusos" agora lista `nextjs`
- Distinção explícita entre `typescript-react` (SPA com Vite) e `nextjs` (full-stack web)

### `.claude/stacks/typescript-react/README.md`
- Seção "Quando NÃO usar" agora aponta para o stack `nextjs` existente em vez de instruir a criar um novo

## Não modificado (intencionalmente)

- **Personas dos agentes** (`.claude/agents/*.md`): nenhuma mudança. Os agentes são agnósticos de stack — Renata, Lucas, Bruno, Max, Sofia, Otávio lêem dinamicamente o stack apontado em `project-profile.md`. Adicionar um stack novo NÃO requer editar personas.
- **Rules universais** (`.claude/rules/wisdom/`): princípios SOLID, clean code, etc. permanecem agnósticos.
- **Skills** (`.claude/skills/*/SKILL.md`): seguem operando — `/start-project` agora consegue gerar projeto Next.js consultando o novo stack; `/build-frontend` idem.
- **Protocols, hooks, plugins**: sem mudança. O sistema de vetos, diálogo lateral, cerimônias, e o plugin `understand-anything` (Yara) continuam funcionando idêntico.

## Como verificar

1. Abrir o projeto no Claude Code.
2. No primeiro turno técnico, Viktor deve carregar `project-profile.md` e reconhecer `active_stacks: [nextjs]`.
3. Bruno (scaffolder), Renata (frontend), Sofia (tester), Max (build), Otávio (reviewer) devem ler `.claude/stacks/nextjs/<arquivo>.md` conforme suas necessidades — não precisa avisar nada manualmente.
4. Pedir algo simples ("crie a página inicial do Jogo do Duvido") e observar se as práticas do stack aparecem: Server Component como default, `"use client"` só nas folhas interativas, Server Action para mutação, `next/link`, etc.

## Como reutilizar em outros projetos Next.js

1. Copiar a pasta inteira para o novo projeto.
2. Editar `.claude/project-profile.md`: trocar `project_name`, ajustar `paths.frontend_root` se a estrutura for diferente, etc.
3. Pronto — todo o restante (16 agentes, 8 arquivos do stack `nextjs`, regras universais) já está calibrado.

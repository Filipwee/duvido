# Stack `nextjs`

🪶 Stack para aplicações web full-stack com Next.js (App Router) — frontend rico
com SSR/SSG, Server Components, Server Actions e API Routes em um único projeto.

## Linguagem / Framework

- **Linguagem**: TypeScript (strict mode)
- **Framework**: Next.js 15+ (App Router; Pages Router é legado e não é alvo deste stack)
- **React**: 19+ (Server Components habilitado por padrão)
- **Build/Runtime**: Next.js (Webpack ou Turbopack — `next dev --turbo`)
- **Test**: Vitest + React Testing Library + MSW + Playwright (E2E)
- **Lint/Format**: ESLint (`eslint-config-next`) + Prettier + `prettier-plugin-tailwindcss`
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Forms**: React Hook Form + Zod (Server Actions também validam com Zod)
- **Server state**: nativo (`fetch` em Server Components) ou TanStack Query (só quando há fetching client-side complexo)
- **Client state**: Zustand (quando necessário; Server Components eliminam grande parte dos casos)
- **Auth (quando aplicável)**: Auth.js (NextAuth v5) — não obrigatório do stack

## Quando usar

- Aplicação web que se beneficia de SSR/SSG (SEO, time-to-first-byte, sharing previews)
- Projeto full-stack onde o backend é leve e cabe nas Server Actions / Route Handlers do Next
- Necessidade de renderização híbrida (algumas páginas estáticas, outras dinâmicas, ISR)
- Deploy primário em Vercel (caminho canônico) ou Cloudflare Pages (com adapter)
- Projetos onde o time já domina o ecossistema React + TS

## Quando NÃO usar (alternativa)

- **SPA pura sem SSR e sem backend** → `typescript-react` (Vite) é mais leve e simples
- **Backend complexo com lógica pesada de domínio** → manter Next como frontend e expor backend separado em `java-spring`, `python-fastapi`, `node-typescript` ou `go`
- **App mobile nativo** → React Native (stack não incluído)
- **Site estático simples** → HTML/CSS direto ou Astro/11ty (stacks não incluídos)
- **Aplicação real-time pesada (WebSockets, streams contínuos)** → backend dedicado em outra stack; Next fica só com a UI

## Notas sobre Server vs Client Components

Este é o **eixo principal** do stack. Os agentes (especialmente Renata, Otávio
e Sergio) decidem por componente:

| Use Server Component (default) quando | Use Client Component (`"use client"`) quando |
|---------------------------------------|----------------------------------------------|
| Busca de dados (fetch direto, sem `useEffect`) | Precisa de `useState`, `useReducer`, `useEffect` |
| Acessa segredos (DB, API keys, cookies) | Precisa de event handlers (`onClick`, `onChange`) |
| Renderiza markdown/conteúdo estático | Usa hooks de navegador (`useRouter` do `next/navigation` para mutação, `useSearchParams` em form filters) |
| Quer reduzir bundle JS no cliente | Usa libs que dependem de browser APIs (Framer Motion com gestos, mapas, charts interativos) |

Regra geral: **comece Server, marque Client só quando precisar.** Anti-padrão
clássico: marcar a página inteira como `"use client"` por causa de um botão.

## Notas sobre runtime

Next suporta dois runtimes por rota:
- **Node.js runtime** (default): acesso a libs Node, mais memória, latência maior em cold start
- **Edge runtime** (`export const runtime = "edge"`): roda em V8 isolates, cold start ~10ms, sem APIs Node, limite de tamanho

Este stack assume Node runtime por padrão; Edge só quando o ganho de latência
justifica e a rota é simples (auth, redirects, A/B, geoloc). Sergio (architect)
decide via ADR.

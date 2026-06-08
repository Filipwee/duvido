# Stack `typescript-react`

🪶 Stack para frontend web moderno com React + TypeScript.

## Linguagem / Framework

- **Linguagem**: TypeScript (strict mode)
- **Framework**: React 18+ (Concurrent, Suspense)
- **Build**: Vite 5+
- **Test**: Vitest + React Testing Library + MSW (mocks de rede)
- **Lint/Format**: ESLint (flat config) + Prettier
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Roteamento**: React Router v6+
- **Server state**: TanStack Query (React Query)
- **Client state**: Zustand (Context API para casos triviais)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios com interceptors

## Quando usar

- Aplicação web SPA com fluxos de UI ricos
- Time familiar com ecossistema React + TS
- Necessidade de design system maduro (shadcn/Radix)
- Integração com backend REST (qualquer linguagem)

## Quando NÃO usar (alternativa)

- App mobile nativo → precisaria stack `react-native` (não incluído)
- SSR/SSG pesado, Server Components, Server Actions → use o stack **`nextjs`** desta mesma instalação
- App estático simples → HTML/CSS direto pode ser melhor
- Time sem familiaridade com React → considerar `vue` ou `svelte` (criar stacks)

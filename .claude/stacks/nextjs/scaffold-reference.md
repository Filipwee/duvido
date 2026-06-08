# Scaffold Reference — Next.js / TypeScript

🪶 LIDO SOB DEMANDA por Bruno (scaffolder). Estrutura inicial + dependências.

## Estrutura padrão de um projeto Next.js (App Router)

```
.
├── package.json                    ← scripts dev/build/test/lint/typecheck
├── tsconfig.json                   ← strict, paths @/*, plugin Next
├── next.config.ts                  ← config, images, experimental, output
├── next-env.d.ts                   ← gerado pelo Next, NÃO editar
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs               ← flat config (Next 15+)
├── .prettierrc                     ← com plugin-tailwindcss
├── .env.example                    ← NEXT_PUBLIC_* + server-only com placeholder
├── .env.local                      ← (não commitado) valores reais
├── .gitignore                      ← node_modules, .next, .env.local, coverage
├── README.md
├── public/                         ← assets estáticos (favicon, og-image, etc.)
├── playwright.config.ts            ← se for usar E2E
├── vitest.config.ts                ← config dos testes unitários
└── src/
    ├── app/                        ← App Router (TODAS as rotas)
    │   ├── layout.tsx              ← Root layout (obrigatório)
    │   ├── page.tsx                ← rota /
    │   ├── globals.css             ← Tailwind base/components/utilities
    │   ├── loading.tsx             ← (opcional) UI de loading global
    │   ├── error.tsx               ← (opcional) Error Boundary global
    │   ├── not-found.tsx           ← (opcional) 404
    │   ├── (marketing)/            ← route group sem URL prefix
    │   │   ├── about/page.tsx
    │   │   └── pricing/page.tsx
    │   ├── (app)/                  ← route group para área autenticada
    │   │   ├── layout.tsx          ← layout específico (header autenticado)
    │   │   └── dashboard/page.tsx
    │   ├── transactions/
    │   │   ├── page.tsx            ← /transactions (lista, Server)
    │   │   ├── loading.tsx
    │   │   ├── actions.ts          ← Server Actions ("use server")
    │   │   ├── [id]/
    │   │   │   └── page.tsx        ← /transactions/:id (Server)
    │   │   └── new/
    │   │       ├── page.tsx        ← /transactions/new (Server wrapper)
    │   │       └── form.tsx        ← "use client" form com useActionState
    │   └── api/                    ← Route Handlers (opcional, se houver cliente externo)
    │       └── webhooks/
    │           └── stripe/route.ts
    ├── components/
    │   ├── ui/                     ← shadcn/ui (button, input, dialog...)
    │   └── layout/                 ← Header, Sidebar, Footer (Server quando possível)
    ├── features/                   ← lógica por domínio
    │   └── transactions/
    │       ├── queries.ts          ← funções server-only que leem o DB / API
    │       ├── types.ts            ← tipos do domínio
    │       └── schemas.ts          ← Zod (reusado por Server Action e RHF)
    ├── lib/
    │   ├── db.ts                   ← cliente DB com `import "server-only"`
    │   ├── auth.ts                 ← sessão / auth.js config (server-only)
    │   ├── env.ts                  ← parse de env com Zod (server vs client)
    │   ├── http.ts                 ← se chamar APIs externas, axios/fetch wrapper
    │   ├── logger.ts               ← pino/winston, server-only
    │   └── utils.ts                ← cn(), formatadores
    ├── hooks/                      ← hooks genéricos (Client only)
    ├── stores/                     ← Zustand (Client only)
    └── types/                      ← tipos globais
```

> **Convenção crítica**: arquivos que NÃO devem rodar no client (DB,
> credenciais, jobs) começam com `import "server-only";`. Arquivos que NÃO
> devem rodar no servidor (browser APIs) começam com `import "client-only";`.

## `package.json` mínimo

`dependencies`:
```
next, react, react-dom, zod, clsx, tailwind-merge
```

Por feature (sob demanda):
```
react-hook-form, @hookform/resolvers      ← forms ricos no client
@tanstack/react-query                     ← server state com client cache complexo
zustand                                   ← client state global
next-auth (Auth.js v5)                    ← autenticação
@prisma/client + prisma                   ← ORM (alternativas: drizzle, kysely)
```

`devDependencies`:
```
typescript, @types/node, @types/react, @types/react-dom,
tailwindcss, postcss, autoprefixer,
eslint, eslint-config-next,
prettier, prettier-plugin-tailwindcss,
vitest, @vitejs/plugin-react,
@testing-library/react, @testing-library/jest-dom,
@testing-library/user-event, jsdom, msw,
@playwright/test
```

## Comandos para Bruno usar

```bash
# Verificar Node
node --version    # >= 20.x (LTS)

# Atalho oficial Next — cria projeto com TS, Tailwind, ESLint, App Router, src/
npx create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbo

cd <project-name>

# shadcn/ui setup
npx shadcn@latest init           # responder: TS, default style, base color, src/, tailwind config
npx shadcn@latest add button input dialog form label

# Stack de testes
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event msw \
  @playwright/test
npx playwright install

# Prettier + plugin Tailwind
npm install -D prettier prettier-plugin-tailwindcss

# Stack opcional (instalar conforme features)
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install zustand
```

## Arquivos de configuração base

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Adicione domínios remotos aqui se for usar next/image com URLs externas
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default config;
```

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

### `eslint.config.mjs`

```js
import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
```

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: { reporter: ["text", "html"], include: ["src/**/*.{ts,tsx}"] },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

### `vitest.setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
```

### `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### `.env.example`

```
# Server-only (sem prefixo) — NUNCA expostas ao client
DATABASE_URL=postgres://user:pass@localhost:5432/db
AUTH_SECRET=change-me

# Client-side (prefixo NEXT_PUBLIC_ obrigatório)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `.gitignore` (adições típicas)

```
node_modules
.next
out
build
dist
coverage
.env*.local
*.log
.DS_Store
/playwright-report
/test-results
```

### `.gitattributes`

```
* text=auto eol=lf
```

## Multiplataforma: line endings e encoding

- `.gitattributes`: `* text=auto eol=lf` (consistência Windows/Mac/Linux)
- UTF-8 default em todos os arquivos
- Paths sempre com `/` em imports (Next resolve)
- `node_modules` excluído do antivírus em Windows (acelera builds e instalações)

## Integração com backend separado (quando aplicável)

Se o projeto usa Next como **frontend puro** falando com backend em outra stack
(java-spring, python-fastapi, node-typescript, go), o padrão é:

- Server Components fazem `fetch(BACKEND_URL + "/api/v1/...")` direto (server→server, sem CORS, sem credencial no client)
- Client Components que precisam falar com backend chamam Route Handler interno que faz proxy (`src/app/api/.../route.ts`)
- Server Actions chamam o backend internamente

Tipos do domínio espelham o contrato REST do backend em `src/features/<dom>/types.ts` —
mesma convenção do stack `typescript-react`.

CORS: se o backend ficar em domínio diferente em produção, configurar lá. Em
dev, geralmente Server Components mascaram (fetch é server-to-server).

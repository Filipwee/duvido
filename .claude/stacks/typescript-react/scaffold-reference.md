# Scaffold Reference — React / TypeScript / Vite

🪶 LIDO SOB DEMANDA por Bruno (scaffolder). Estrutura inicial + dependências.

## Estrutura padrão de um projeto React

```
frontend/
├── package.json                    ← scripts dev/build/test/lint/typecheck
├── tsconfig.json                   ← strict, paths @/*
├── tsconfig.node.json
├── vite.config.ts                  ← proxy /api → backend, alias @/
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── eslint.config.js                ← ou .eslintrc.cjs (flat config preferido)
├── .prettierrc
├── .env.example                    ← VITE_API_URL=http://localhost:8080
├── .gitignore                      ← node_modules, dist, .env.local
├── public/                         ← assets estáticos
└── src/
    ├── main.tsx                    ← bootstrap
    ├── App.tsx                     ← rotas principais
    ├── index.css                   ← @tailwind base/components/utilities
    ├── routes/                     ← uma pasta por rota
    │   └── transactions/
    │       └── TransactionsPage.tsx
    ├── components/
    │   ├── ui/                     ← shadcn/ui (button, input, dialog...)
    │   └── layout/                 ← Header, Sidebar, etc.
    ├── features/                   ← lógica por domínio
    │   └── transactions/
    │       ├── api.ts              ← chamadas axios
    │       ├── hooks.ts            ← useTransactions, useCreateTransaction
    │       ├── types.ts            ← tipos (espelho dos DTOs do back)
    │       └── schemas.ts          ← validação Zod
    ├── lib/
    │   ├── axios.ts                ← instância configurada
    │   ├── queryClient.ts
    │   └── utils.ts                ← cn(), formatadores
    ├── hooks/                      ← hooks genéricos (useDebounce, useMediaQuery)
    ├── stores/                     ← Zustand (auth, theme, etc.)
    └── types/                      ← tipos globais
```

## `package.json` mínimo

Dependências (`dependencies`):

```
react, react-dom, react-router-dom, axios, @tanstack/react-query,
zustand, react-hook-form, zod, @hookform/resolvers, clsx, tailwind-merge
```

Dev dependencies (`devDependencies`):

```
vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom,
tailwindcss, postcss, autoprefixer,
eslint, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks,
eslint-plugin-jsx-a11y, prettier, eslint-config-prettier,
vitest, @testing-library/react, @testing-library/jest-dom,
@testing-library/user-event, jsdom, msw
```

## Arquivos de configuração obrigatórios

- `tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`, paths `@/*`
- `vite.config.ts` — alias `@/` para `./src`, proxy `/api` para backend em dev
- `tailwind.config.ts` — `content: ["./src/**/*.{ts,tsx,html}"]`
- `eslint.config.js` — flat config (ESLint 9+) com `typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `prettier`
- `.env.example` — variáveis com prefixo `VITE_` (obrigatório)
- `.gitignore` — `node_modules`, `dist`, `.env.local`, `coverage`, `*.log`

## Multiplataforma: line endings e encoding

- `.gitattributes` na raiz: `* text=auto eol=lf`
- UTF-8 default em todos os arquivos
- Paths sempre com `/` em imports (Vite resolve)
- `node_modules` excluído do antivírus em Windows (acelera builds)

## Comandos para Bruno usar

```bash
# Verificar Node
node --version    # >= 20

# Atalho oficial Vite para criar projeto novo
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Tailwind setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button input dialog form

# Dependências do stack
npm install react-router-dom axios @tanstack/react-query zustand \
            react-hook-form zod @hookform/resolvers clsx tailwind-merge

# Test setup
npm install -D vitest @testing-library/react @testing-library/jest-dom \
               @testing-library/user-event jsdom msw
```

## `vite.config.ts` base

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
```

## `tsconfig.json` base (strict)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

## Integração com qualquer backend

Quando este stack convive com um stack backend (java-spring, python-fastapi,
node-typescript, go), o backend expõe REST em uma porta (8080 default) e o
Vite faz proxy `/api/*` para essa porta. Não importa a linguagem do backend
— o contrato REST é o ponto único de integração. Renata espelha os DTOs em
`features/<x>/types.ts`.

Atualiza o `.gitignore` da raiz adicionando:
```
frontend/node_modules/
frontend/dist/
frontend/.env.local
frontend/coverage/
```

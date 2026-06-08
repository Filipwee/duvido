# Regras de Linguagem — Next.js + TypeScript

🪶 LIDO SOB DEMANDA por Renata (frontend) e Lucas (backend, quando o backend
mora em Server Actions / Route Handlers). Convenções da linguagem, do React e
do Next.js App Router.

## TypeScript — configuração estrita

`tsconfig.json` obrigatório (Next preenche a maioria via `next.config.ts`):

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
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

> `jsx: "preserve"` é correto para Next (Next compila com SWC, não com tsc).
> Não trocar para `react-jsx` — quebra o build.

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Rota (App Router) | kebab-case ou camelCase em pasta; arquivo é `page.tsx` | `src/app/transactions/page.tsx` |
| Layout / loading / error | nome especial obrigatório do Next | `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` |
| Route group (não vira URL) | pasta entre parênteses | `src/app/(marketing)/about/page.tsx` |
| Componente | PascalCase | `TransactionList.tsx` |
| Server Action | camelCase, verbo | `createTransaction.ts` |
| Hook | camelCase com prefixo `use` | `useTransactions.ts` |
| Tipo / Interface | PascalCase | `type Transaction` |
| Constante | SCREAMING_SNAKE ou camelCase | `MAX_RETRIES`, `routePaths` |
| Arquivo utilitário | camelCase.ts | `formatCurrency.ts` |

## Arquivos especiais do App Router (lembrete)

```
src/app/
├── layout.tsx            ← layout raiz (obrigatório, contém <html> e <body>)
├── page.tsx              ← rota /
├── loading.tsx           ← UI de loading (Suspense automático)
├── error.tsx             ← Error Boundary (precisa ser Client Component)
├── not-found.tsx         ← rota 404
├── global-error.tsx      ← captura erros do root layout
├── route.ts              ← Route Handler (GET/POST/...)
├── opengraph-image.tsx   ← OG image gerada
└── sitemap.ts | robots.ts ← gerados no build
```

## `"use client"` e `"use server"` — onde declarar

```tsx
// ✅ Server Component (default, sem diretiva)
// src/app/transactions/page.tsx
export default async function TransactionsPage() {
  const transactions = await db.transactions.findMany();
  return <TransactionList transactions={transactions} />;
}

// ✅ Client Component — primeira linha do arquivo
// src/components/TransactionForm.tsx
"use client";
import { useState } from "react";
// ...

// ✅ Server Action — primeira linha da função OU do arquivo
"use server";
export async function createTransaction(data: TransactionRequest) {
  // ...
}
```

**Regra**: a diretiva marca o **boundary**. Tudo importado por um arquivo
`"use client"` vira parte do bundle client; tudo importado por um arquivo sem
diretiva continua no servidor. Não polua client com lógica de servidor e
vice-versa.

## Type vs Interface

```ts
// ✅ Padrão — type
type Transaction = { id: string; amount: number };
type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";
type TransactionRequest = Omit<Transaction, "id" | "createdAt">;
```

`interface` apenas para contratos públicos extensíveis (raro no domínio).

## Evite `any` — alternativas

```ts
// ❌ Perde toda a type-safety
async function handle(data: any) { return data.something; }

// ✅ unknown + Zod (preferido em boundary de I/O — Server Action, Route Handler)
const schema = z.object({ something: z.string() });
async function handle(data: unknown) {
  const parsed = schema.parse(data);
  return parsed.something;
}

// ✅ Generic
function identity<T>(value: T): T { return value; }
```

## Server Components — buscar dados direto

```tsx
// ✅ Async componente, fetch direto, sem useEffect, sem useState
export default async function TransactionsPage() {
  const transactions = await fetch("https://api.example.com/transactions", {
    next: { revalidate: 60 }, // ISR — revalida a cada 60s
  }).then(r => r.json() as Promise<Transaction[]>);

  return <TransactionList transactions={transactions} />;
}

// ✅ Fetch paralelo (ambos disparam juntos)
export default async function Dashboard() {
  const [user, stats] = await Promise.all([getUser(), getStats()]);
  return <Layout user={user} stats={stats} />;
}
```

`fetch` do Next é estendido: `cache: "force-cache" | "no-store"`, `next: { revalidate, tags }`.

## Client Components — quando precisa de estado

```tsx
"use client";
import { useState } from "react";

type Props = {
  initial: number;
  onSave?: (n: number) => void;
};

export function Counter({ initial, onSave }: Props) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+1 ({count})</button>
      {onSave && <button onClick={() => onSave(count)}>Salvar</button>}
    </div>
  );
}
```

## Server Actions — forma canônica de mutação

```ts
// src/app/transactions/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),
});

export async function createTransaction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  await db.transactions.create({ data: parsed.data });
  revalidatePath("/transactions");
  redirect("/transactions");
}
```

Ligado ao form:

```tsx
// src/app/transactions/new/page.tsx (Server Component)
import { createTransaction } from "../actions";

export default function NewTransactionPage() {
  return (
    <form action={createTransaction} className="space-y-4">
      <input name="description" />
      <input name="amount" type="number" step="0.01" />
      <button type="submit">Criar</button>
    </form>
  );
}
```

Para feedback no cliente, use `useActionState` (React 19) num Client Component
wrapper.

## Route Handlers — quando preferir sobre Server Action

```ts
// src/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const items = await db.transactions.findMany({ where: { userId } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({ description: z.string(), amount: z.number() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const created = await db.transactions.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
```

Use Route Handler em vez de Server Action quando: cliente não-React vai consumir
(webhook, mobile, terceiro), precisa de método HTTP específico, ou precisa
controlar headers de resposta finamente.

## `next/link` e `next/navigation`

```tsx
// ✅ Link client-side (prefetch automático em viewport)
import Link from "next/link";
<Link href="/transactions/123">Ver</Link>

// ✅ Navegação programática (apenas em Client Components)
"use client";
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/transactions");

// ❌ NÃO importe do "next/router" — esse é o Pages Router (legado)
```

## Imagens

```tsx
import Image from "next/image";

// ✅ Imagem local — width/height inferido
import logo from "@/assets/logo.png";
<Image src={logo} alt="Logo" priority />

// ✅ Imagem remota — width/height obrigatórios
<Image src="https://cdn.example.com/x.jpg" alt="..." width={800} height={600} />

// next.config.ts precisa permitir domínios remotos:
// images: { remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }] }
```

## Variáveis de ambiente

```
# .env.local (não commitar)
DATABASE_URL=postgres://...           # SERVER ONLY (default)
STRIPE_SECRET=sk_...                  # SERVER ONLY
NEXT_PUBLIC_GA_ID=G-XXXX              # expõe ao client (prefixo obrigatório)
```

```ts
// ✅ Server Component / Server Action / Route Handler
const dbUrl = process.env.DATABASE_URL!;

// ❌ Client Component sem prefixo NEXT_PUBLIC_ — undefined em runtime
const apiKey = process.env.STRIPE_SECRET; // undefined no browser

// ✅ Client Component
const gaId = process.env.NEXT_PUBLIC_GA_ID;
```

Tipar o env (recomendado): use `@t3-oss/env-nextjs` ou um `env.ts` próprio com Zod.

## Imports — ordem e alias

```ts
// 1. React / Next
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// 2. Libs externas
import { z } from "zod";

// 3. Internos via alias @/
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

// 4. Relativos (mesma feature)
import { TransactionItem } from "./TransactionItem";
import type { Transaction } from "./types";
```

## React Hooks — regras (Client Components)

```tsx
// ✅ Dependency array completa
useEffect(() => { fetchData(userId); }, [userId]);

// ✅ Cleanup
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

// ❌ Não usar useEffect para data fetching em Server Component (nem dá pra usar)
// ❌ Em Client Component, prefira TanStack Query a useEffect+fetch
```

## Forms — React Hook Form + Zod (client) OU Server Action + Zod (server)

```tsx
// ✅ Form que precisa de UX rica (validação em tempo real, máscara, etc.) — Client + RHF
"use client";
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormData = z.infer<typeof schema>;

export function LoginForm({ action }: { action: (d: FormData) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  return <form onSubmit={handleSubmit(action)}>{/* ... */}</form>;
}

// ✅ Form simples — Server Action com FormData direto (sem JS no client)
<form action={createTransaction}>
  <input name="description" required />
  <button type="submit">Salvar</button>
</form>
```

## Tailwind — convenções

```tsx
import { cn } from "@/lib/utils";

<div className={cn("p-4 rounded", isActive && "bg-primary", className)}>

// Multi-line
<button className={cn(
  "inline-flex items-center justify-center",
  "rounded-md px-4 py-2 text-sm font-medium",
  "hover:bg-accent disabled:opacity-50",
)}>
```

`prettier-plugin-tailwindcss` ordena classes automaticamente.

## ESLint — base recomendada

```js
// eslint.config.mjs (flat config, Next 15+)
import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react/jsx-key": "error",
    },
  },
];
```

## Diferenças críticas vs Vite/React (`typescript-react`)

| Tema | Vite + React | Next.js |
|------|--------------|---------|
| Variável env exposta no client | `import.meta.env.VITE_X` | `process.env.NEXT_PUBLIC_X` |
| Roteamento | React Router (config em código) | File-based (App Router) |
| Data fetching | useEffect + fetch ou TanStack Query | Server Component async + `fetch` nativo |
| Mutação | Função → API → invalidar query | Server Action ou Route Handler |
| SSR | Não há (SPA) | Default por rota |
| Hot reload | Vite HMR (rápido) | Next dev (Turbopack ou Webpack) |
| Build output | `dist/` estático | `.next/` + runtime Node ou Edge |
| Deploy padrão | Qualquer CDN estático | Vercel (canônico) ou self-hosted Node |

Migrar de Vite/RR para Next: páginas viram pastas em `src/app/`, fetch sai do
`useEffect` e vai pro Server Component, mutações viram Server Actions, env
muda prefixo. ADR obrigatório (Sergio) antes da migração.

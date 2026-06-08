# Skeletons de Código — Next.js / React / TypeScript

🪶 LIDO SOB DEMANDA por Renata. Complementa `language-rules.md`, `patterns.md`,
`anti-patterns.md`. Skeletons aqui são "código pronto pra copiar e adaptar".

## Stack padrão do projeto

| Camada | Ferramenta |
|--------|-----------|
| Framework | Next.js 15+ (App Router) |
| Linguagem | TypeScript (strict mode) |
| React | 19+ (Server Components habilitado) |
| Estilização | Tailwind CSS + shadcn/ui |
| Roteamento | File-based (App Router) — sem React Router |
| Server state | Server Component + `fetch` nativo; TanStack Query apenas quando há fetching client-side complexo |
| Client state | Zustand (quando necessário) |
| Forms | React Hook Form + Zod (client) OU Server Action + Zod (server) |
| Mutações | Server Action (preferido) ou Route Handler |
| Testes unit | Vitest + React Testing Library |
| Testes E2E | Playwright |
| Lint | ESLint (`eslint-config-next`) + Prettier |

## Root layout

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "App", template: "%s | App" },
  description: "Descrição padrão",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

## Server Component que busca dados

```tsx
// src/app/transactions/page.tsx
import { notFound } from "next/navigation";
import { listTransactions } from "@/features/transactions/queries";
import { TransactionList } from "./transaction-list";

export const metadata = { title: "Transações" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const transactions = await listTransactions({ status });
  if (!transactions) notFound();

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-semibold">Transações</h1>
      <TransactionList transactions={transactions} />
    </main>
  );
}
```

## Dynamic route com `params`

```tsx
// src/app/transactions/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTransaction } from "@/features/transactions/queries";

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await getTransaction(id);
  if (!transaction) notFound();
  return (
    <article className="container mx-auto py-8">
      <h1>{transaction.description}</h1>
      <p>{transaction.amount}</p>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTransaction(id);
  return { title: t?.description ?? "Transação não encontrada" };
}
```

## Loading e Error UI

```tsx
// src/app/transactions/loading.tsx
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="container mx-auto py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <span className="sr-only">Carregando transações...</span>
    </div>
  );
}
```

```tsx
// src/app/transactions/error.tsx
"use client";
export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="container mx-auto py-8">
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
        Tentar novamente
      </button>
    </div>
  );
}
```

## Query layer (server-only)

```ts
// src/features/transactions/queries.ts
import "server-only";
import { db } from "@/lib/db";
import { cache } from "react";
import type { Transaction } from "./types";

export const listTransactions = cache(
  async (opts?: { status?: string }): Promise<Transaction[]> => {
    return db.transaction.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
);

export const getTransaction = cache(
  async (id: string): Promise<Transaction | null> => {
    return db.transaction.findUnique({ where: { id } });
  }
);
```

## Server Actions com Zod

```ts
// src/app/transactions/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  description: z.string().min(1, "obrigatório").max(200),
  amount: z.coerce.number().positive("valor deve ser positivo"),
});

export type CreateState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

export async function createTransaction(
  _prev: CreateState | null,
  formData: FormData,
): Promise<CreateState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await db.transaction.create({ data: parsed.data });
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
}
```

## Form com Server Action + `useActionState` (Client)

```tsx
// src/app/transactions/new/form.tsx
"use client";

import { useActionState } from "react";
import { createTransaction, type CreateState } from "../actions";

export function NewTransactionForm() {
  const [state, action, pending] = useActionState<CreateState | null, FormData>(
    createTransaction,
    null,
  );

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <input
          id="description"
          name="description"
          className="mt-1 w-full rounded border px-3 py-2"
          aria-invalid={state?.ok === false && !!state.errors.description}
          aria-describedby={state?.ok === false ? "description-error" : undefined}
        />
        {state?.ok === false && state.errors.description && (
          <p id="description-error" className="mt-1 text-sm text-destructive">
            {state.errors.description.join(", ")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Valor
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

## Route Handler (Route HTTP — para cliente externo)

```ts
// src/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const items = await db.transaction.findMany({
    where: status ? { status } : undefined,
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const created = await db.transaction.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
```

## Middleware (auth gate simples)

```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*"],
};
```

## Cliente DB tipado e server-only

```ts
// src/lib/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## Env tipada (Zod)

```ts
// src/lib/env.ts
import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = serverSchema.parse(process.env);

// Client env (sem server-only)
export const clientEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
};
```

## Componente UI client mínimo (Tailwind + cn)

```tsx
// src/components/ui/button.tsx
"use client";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    />
  );
}
```

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Zustand store (client-only)

```ts
// src/stores/ui-store.ts
"use client";
import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## Tipos do domínio (espelho do contrato)

```ts
// src/features/transactions/types.ts
export type Transaction = {
  id: string;
  description: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
};

export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TransactionRequest = Omit<Transaction, "id" | "status" | "createdAt">;
```

## Schemas Zod compartilhados

```ts
// src/features/transactions/schemas.ts
import { z } from "zod";

export const transactionSchema = z.object({
  description: z.string().min(1, "obrigatório").max(200),
  amount: z.coerce.number().positive("valor deve ser positivo"),
});

export type TransactionForm = z.infer<typeof transactionSchema>;
```

## Acessibilidade — checklist mínima (vale o mesmo do React puro)

- [ ] `<html lang="pt-BR">` no `layout.tsx` raiz
- [ ] HTML semântico: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- [ ] 1× `<h1>` por página, hierarquia de headings
- [ ] Foco visível em todos os interativos
- [ ] Contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande)
- [ ] `next/image` com `alt` (decorativa: `alt=""`)
- [ ] Forms: `<label htmlFor>` em todo input; erro vinculado via `aria-describedby`
- [ ] `loading.tsx` com `role="status"` e `aria-live`
- [ ] `error.tsx` com `role="alert"`

## Performance — boas práticas Next

- **Server Component** como default; `"use client"` só nas folhas
- **`next/image`** sempre — lazy, srcset, AVIF/WebP
- **`next/font`** para fontes locais ou Google (zero CLS, self-host)
- **`<Suspense>`** granular pra streaming
- **`priority`** em imagem above-the-fold do LCP
- **ISR**: `fetch(url, { next: { revalidate: 60 } })` em dados que mudam pouco
- **Bundle**: `@next/bundle-analyzer` periodicamente; `optimizePackageImports` em libs sabidas
- **`<Link prefetch>`** já é default em viewport

# Padrões — Next.js / React / TypeScript

🪶 LIDO SOB DEMANDA por Renata (escrever) e Otávio (revisar).

> Princípios universais vivem em `rules/wisdom/`. Padrões React puros vivem
> em `stacks/typescript-react/patterns.md`. Aqui apenas o que é específico
> do Next.js App Router.

## Server-first — default em tudo

```tsx
// ✅ Padrão: nada de "use client"; busca dados direto; renderiza no servidor
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  return <ProductView product={product} />;
}

// ✅ Marca só a "ilha" que precisa interatividade
"use client";
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

**Anti-padrão**: marcar uma page inteira como `"use client"` por causa de um
botão. Isso anula SSR e infla o bundle.

## Composição Server → Client (passar Server Component como children)

```tsx
// Client Component aceita ReactNode — pode receber Server Component dentro
"use client";
export function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  return <div>{Array.isArray(children) ? children[active] : children}</div>;
}

// Server Component pai monta a árvore — Tab1 e Tab2 podem ser async!
export default function Page() {
  return (
    <Tabs>
      <ServerTab1 />
      <ServerTab2 />
    </Tabs>
  );
}
```

Isso é o que permite manter o máximo no servidor mesmo com UI interativa.

## Loading e Error UI por rota

```
src/app/transactions/
├── page.tsx          ← async, busca dados
├── loading.tsx       ← Suspense fallback (UI de skeleton)
└── error.tsx         ← Error Boundary ("use client" obrigatório)
```

```tsx
// loading.tsx
export default function Loading() {
  return <TransactionSkeleton />;
}

// error.tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <p>Algo deu errado: {error.message}</p>
      <button onClick={reset}>Tentar de novo</button>
    </div>
  );
}
```

## Streaming com `<Suspense>` granular

```tsx
import { Suspense } from "react";

// ✅ Stream cada bloco quando estiver pronto — não bloqueia a página inteira
export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<RecentSkeleton />}>
        <RecentTransactions />
      </Suspense>
    </main>
  );
}

async function Stats() {
  const stats = await fetchStats(); // lento
  return <StatsView stats={stats} />;
}
```

## `revalidatePath` e `revalidateTag` em mutações

```ts
"use server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateTransaction(id: string, data: TransactionUpdate) {
  await db.transactions.update({ where: { id }, data });
  revalidatePath(`/transactions/${id}`);   // ← invalida só essa rota
  revalidatePath("/transactions");          // ← e a listagem
}

// ✅ Tag-based — quando vários paths usam o mesmo dado
const data = await fetch(url, { next: { tags: ["transactions"] } });
// depois:
revalidateTag("transactions"); // invalida tudo que tem essa tag
```

**Anti-padrão**: `revalidatePath("/")` (revalida tudo). Caro e desnecessário.

## `cache` para deduplicar `fetch` no mesmo render

```ts
import { cache } from "react";

// ✅ Chamado várias vezes no mesmo request → uma única ida ao DB
export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

Útil quando layout + page + componente filho precisam do mesmo dado.

## Form com Server Action e `useActionState` (feedback no client)

```tsx
// app/transactions/actions.ts
"use server";
import { z } from "zod";

const schema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export type ActionState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

export async function createTransaction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  await db.transactions.create({ data: parsed.data });
  return { ok: true };
}
```

```tsx
// app/transactions/new/form.tsx
"use client";
import { useActionState } from "react";
import { createTransaction } from "../actions";

export function NewTransactionForm() {
  const [state, action, pending] = useActionState(createTransaction, null);
  return (
    <form action={action} className="space-y-4">
      <input name="description" />
      {state?.ok === false && state.errors.description && (
        <p className="text-destructive">{state.errors.description.join(", ")}</p>
      )}
      <input name="amount" type="number" step="0.01" />
      <button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

## Quando usar TanStack Query

```tsx
// ✅ Use Query quando:
// - Polling automático (live data)
// - Cache compartilhado entre client components
// - Mutações otimistas com rollback
// - Paginação infinita complexa

// Para listagens estáticas / SEO / dados de página: Server Component + fetch nativo
// é melhor que client + React Query.
```

Se for usar Query, configure o provider apenas na **árvore client**:

```tsx
// src/app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// src/app/layout.tsx
import { Providers } from "./providers";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body><Providers>{children}</Providers></body></html>;
}
```

## Middleware — quando vale a pena

```ts
// src/middleware.ts — roda em Edge runtime, antes da rota matchar
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ✅ Casos legítimos: redirect baseado em auth, A/B, geo, locale
  const token = request.cookies.get("session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

**Anti-padrão**: lógica de domínio em middleware. Middleware é pra decisão
binária rápida (redirect, header). Validar payload, falar com DB pesado → faça
no Server Component ou Route Handler.

## Metadata dinâmica para SEO

```tsx
import type { Metadata } from "next";

// ✅ Static metadata
export const metadata: Metadata = {
  title: "Transações",
  description: "Histórico de transações",
};

// ✅ Dynamic metadata — busca de dados pra montar
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return {
    title: product?.name ?? "Produto não encontrado",
    openGraph: { images: product?.image ? [product.image] : [] },
  };
}
```

## Anti-padrões frequentes em Next.js

### `"use client"` no topo da árvore

```tsx
// ❌ Tudo vira client — perde SSR, infla bundle
"use client"; // no layout.tsx ou page.tsx raiz
```

Mova `"use client"` para o **componente folha** que precisa.

### `useEffect` para buscar dados em Server-capable Component

```tsx
// ❌ Component que poderia ser Server
"use client";
export function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setData); }, []);
  return <div>{data?.total}</div>;
}

// ✅ Server Component direto
export default async function Dashboard() {
  const data = await fetch("https://api/stats").then(r => r.json());
  return <div>{data.total}</div>;
}
```

### Importar código de servidor em Client Component

```tsx
// ❌ Importa o cliente DB dentro de "use client" → leak de credencial / quebra build
"use client";
import { db } from "@/lib/db"; // ERRO: bundle client tenta empacotar driver Node
```

Use `import "server-only"` no arquivo do DB pra prevenir:

```ts
// src/lib/db.ts
import "server-only"; // erro de build se for importado em client
export const db = /* ... */;
```

Análogo: `import "client-only"` em arquivos que dependem de browser APIs.

### Mutação via Route Handler quando Server Action resolveria

```tsx
// ❌ Boilerplate inútil pra form interno
"use client";
const handleSubmit = async (data) => {
  await fetch("/api/transactions", { method: "POST", body: JSON.stringify(data) });
  router.refresh();
};

// ✅ Server Action — sem rota HTTP, sem fetch, sem refresh manual
import { createTransaction } from "./actions";
<form action={createTransaction}>...</form>
```

Route Handler é pra cliente externo. Form interno → Server Action.

### Confiar no client-side check de auth

```tsx
// ❌ Bypass trivial: usuário desativa JS ou edita storage
"use client";
const isAdmin = useStore(s => s.user.isAdmin);
return isAdmin ? <AdminPanel /> : <Forbidden />;

// ✅ Check no servidor (Server Component) ou middleware
export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user.isAdmin) redirect("/");
  return <AdminPanel />;
}
```

### Cache stale por esquecer de revalidar

```ts
// ❌ Mutação não invalida — UI continua mostrando dado velho até o usuário recarregar
"use server";
export async function deleteTransaction(id: string) {
  await db.transactions.delete({ where: { id } });
  // esqueceu revalidatePath
}

// ✅
export async function deleteTransaction(id: string) {
  await db.transactions.delete({ where: { id } });
  revalidatePath("/transactions");
}
```

### `params`/`searchParams` sem `await` (Next 15+)

```tsx
// ❌ Next 15+ — params é Promise
export default function Page({ params }: { params: { id: string } }) {
  console.log(params.id); // TypeError em runtime
}

// ✅
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## Performance — boas práticas Next

- **Imagens**: `next/image` sempre que possível (lazy, srcset, AVIF/WebP)
- **Fontes**: `next/font` (auto-self-host, sem CLS)
- **`priority`** em imagem above-the-fold do LCP
- **Streaming**: `<Suspense>` granular vs página bloqueada
- **Bundle**: `@next/bundle-analyzer` pra detectar lib pesada em client
- **Prefetch**: `<Link>` já faz, desativar com `prefetch={false}` se ruim
- **ISR**: `revalidate` em fetch quando dado muda raramente
- **PPR (Partial Prerendering)**: experimental — habilita renderização híbrida estática+dinâmica na mesma rota

## Acessibilidade (a11y) — mesmas regras do React, com adições do Next

- `<html lang="pt-BR">` no `layout.tsx` raiz (obrigatório)
- `next/link` mantém `<a>` semântico — Tab funciona, screen reader anuncia
- `next/image` exige `alt` obrigatório
- `loading.tsx` deve ter `role="status"` ou texto anunciado
- `error.tsx` deve ter `role="alert"`

## Definition of Done — entrega de feature Next.js

- [ ] TS compila sem erro (`npm run typecheck`)
- [ ] ESLint zero warning (`npm run lint`)
- [ ] Build produção passa (`npm run build`) — atenção a "Module not found" só em build
- [ ] Testes Vitest verdes (hooks/lógica) + Playwright básico (fluxo crítico)
- [ ] Server Component como default — `"use client"` só nas folhas necessárias
- [ ] Mutações com Server Action OU Route Handler (consistente, justificado)
- [ ] `revalidatePath` / `revalidateTag` em todas as mutações que invalidam UI
- [ ] Env vars do client com prefixo `NEXT_PUBLIC_`, server vars sem prefixo
- [ ] Loading state via `loading.tsx` ou `<Suspense>`
- [ ] Error state via `error.tsx`
- [ ] Empty state explícito quando aplicável
- [ ] Mobile (375px) e desktop (1280px) verificados
- [ ] Lighthouse mobile ≥ 90 em Performance, Acessibilidade e SEO (se rota pública)

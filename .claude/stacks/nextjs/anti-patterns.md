# Anti-Patterns — Next.js / React / TypeScript

🪶 LIDO SOB DEMANDA por Renata (escrever), Otávio (revisar) e Nina (security
em casos de leak server→client).

> Universais vivem em `rules/wisdom/anti-patterns.md`. Anti-patterns de React
> puro estão em `stacks/typescript-react/anti-patterns.md`. Aqui apenas o que
> é específico do Next.js App Router.

## `"use client"` na raiz da árvore

```tsx
// ❌ layout.tsx ou page.tsx com "use client" — tudo abaixo vira client bundle
"use client";
export default function RootLayout({ children }) { return <>{children}</>; }

// ✅ Server Component como default; isolar interatividade em componentes folha
export default function RootLayout({ children }) { return <>{children}</>; }
// Component interativo separado:
"use client";
export function ThemeToggle() { /* ... */ }
```

Custo: perde SSR, infla bundle JS, anula benefício do App Router.

## Importar código server-only em Client Component

```tsx
// ❌ "use client" importando driver de DB — build quebra ou (pior) vaza credencial
"use client";
import { db } from "@/lib/db";

// ✅ Marcar o arquivo como server-only para falhar cedo
// src/lib/db.ts
import "server-only";
export const db = /* ... */;
```

Análogo: `import "client-only"` para arquivos que usam `window`/`document`.

## `useEffect` para buscar dado que poderia ser Server Component

```tsx
// ❌ Tela em branco até o effect rodar; pior SEO; sem cache
"use client";
const [data, setData] = useState(null);
useEffect(() => { fetch("/api/x").then(r => r.json()).then(setData); }, []);

// ✅ Server Component async, fetch direto
export default async function Page() {
  const data = await fetch("https://api/x").then(r => r.json());
  return <View data={data} />;
}
```

## `process.env.X` sem `NEXT_PUBLIC_` em Client Component

```tsx
// ❌ undefined em runtime no browser
"use client";
const key = process.env.STRIPE_PUBLIC_KEY; // ← sem prefixo, vira undefined

// ✅ prefixo obrigatório para client
const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
```

E **nunca** expor secrets (sem prefixo) por engano em client. `import "server-only"`
em arquivos que leem secrets blinda.

## `params` / `searchParams` sem `await` (Next 15+)

```tsx
// ❌ params é Promise em Next 15+
export default function Page({ params }: { params: { id: string } }) {
  console.log(params.id); // TypeError
}

// ✅
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## `revalidatePath("/")` em qualquer mutação

```ts
// ❌ Invalida o site inteiro — mata o cache, pior performance, pior custo
"use server";
export async function updateOne() {
  await db.x.update(...);
  revalidatePath("/");
}

// ✅ Invalidar só o que mudou
revalidatePath("/transactions");
revalidatePath(`/transactions/${id}`);
// ou tag-based:
revalidateTag("transactions");
```

## Mutação sem revalidar (UI fantasma)

```ts
// ❌ Dado mudou no servidor mas tela continua mostrando o velho
"use server";
export async function deleteX(id: string) {
  await db.x.delete({ where: { id } });
  // esqueceu de invalidar
}

// ✅
await db.x.delete({ where: { id } });
revalidatePath("/x");
```

## Auth checado só no client

```tsx
// ❌ Trivial de burlar (desativar JS, editar store, etc.)
"use client";
const isAdmin = useStore(s => s.user.isAdmin);
return isAdmin ? <Admin /> : <Forbidden />;

// ✅ No servidor (Server Component, middleware, ou ambos)
export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user.isAdmin) redirect("/");
  return <Admin />;
}
```

## Route Handler para form interno (Server Action resolve)

```tsx
// ❌ Boilerplate: rota HTTP + fetch + router.refresh + tratamento manual de erro
"use client";
async function onSubmit(data) {
  await fetch("/api/transactions", { method: "POST", body: JSON.stringify(data) });
  router.refresh();
}

// ✅ Server Action — sem rota, sem fetch, com revalidação no próprio action
import { createTransaction } from "./actions";
<form action={createTransaction}>...</form>
```

Route Handler é pra cliente externo (webhook, mobile, terceiro).

## Server Action sem validação Zod

```ts
// ❌ Confia em FormData direto — usuário envia tipo errado, action explode
"use server";
export async function createX(formData: FormData) {
  await db.x.create({ data: Object.fromEntries(formData) as any });
}

// ✅
const schema = z.object({ name: z.string().min(1), amount: z.coerce.number().positive() });
export async function createX(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten() };
  await db.x.create({ data: parsed.data });
  return { ok: true as const };
}
```

Server Actions são endpoints HTTP — tratar como qualquer endpoint público.

## `<a href>` para navegação interna

```tsx
// ❌ Recarrega a página inteira; perde prefetch
<a href="/transactions">Ir</a>

// ✅
import Link from "next/link";
<Link href="/transactions">Ir</Link>
```

Exceções: link externo, download, âncora pura (`#section`).

## `<img>` em vez de `<Image>`

```tsx
// ❌ Sem lazy, sem srcset, sem otimização
<img src="/big.jpg" alt="..." />

// ✅
import Image from "next/image";
<Image src="/big.jpg" alt="..." width={800} height={600} />
```

Exceção justificável: SVG inline, imagem dinâmica de URL desconhecida sem dimensão.

## Middleware com lógica de domínio

```ts
// ❌ Middleware fala com DB, valida payload, faz I/O pesado — aumenta TTFB de tudo
export async function middleware(req) {
  const user = await db.user.findUnique({ where: { id: req.cookies.get("uid")?.value } });
  if (!user.active) return NextResponse.redirect(new URL("/banned", req.url));
  // ...
}

// ✅ Decisão rápida no middleware; lógica no Server Component
export function middleware(req) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
// Validação detalhada vai pro Server Component da rota destino.
```

Middleware roda em **toda** request matchada — caro por padrão.

## Fetch sem `cache` ou `next.revalidate` em Server Component

```ts
// ❌ Default mudou em versões recentes; comportamento ambíguo
const data = await fetch(url);

// ✅ Decisão explícita
const data = await fetch(url, { cache: "force-cache" });               // estático
const data = await fetch(url, { next: { revalidate: 60 } });           // ISR 60s
const data = await fetch(url, { cache: "no-store" });                  // sempre fresh
const data = await fetch(url, { next: { tags: ["transactions"] } });   // tag-based
```

Documenta intenção e evita surpresa quando o Next muda default.

## Importar `next/router` (Pages Router)

```ts
// ❌ Pages Router (legado) — App Router não usa
import { useRouter } from "next/router";

// ✅ App Router
import { useRouter, usePathname, useSearchParams } from "next/navigation";
```

## Re-renderizar Client Component inteiro por causa de `searchParams`

```tsx
// ❌ Lê searchParams no client, força "use client" em tela inteira
"use client";
import { useSearchParams } from "next/navigation";

// ✅ Server Component lê searchParams como prop e passa só o necessário para a "ilha" client
export default async function Page({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = await search(q);
  return <ResultsView results={results} initialQuery={q} />;
}
```

## Misturar `cookies()` / `headers()` em Client Component

```ts
// ❌ Só funciona em Server Components / Server Actions / Route Handlers
"use client";
import { cookies } from "next/headers"; // erro em runtime

// ✅ Server-side
import { cookies } from "next/headers";
export default async function Page() {
  const token = (await cookies()).get("token")?.value;
}
```

## Logar segredo no servidor (vaza em log de produção)

```ts
// ❌
console.log("DB URL:", process.env.DATABASE_URL);

// ✅ Logger estruturado com redact (pino, winston) ou nunca logar secret
import { logger } from "@/lib/logger";
logger.info({ event: "db.connect" }); // sem credencial
```

## `dangerouslySetInnerHTML` em conteúdo do usuário

```tsx
// ❌ XSS imediato
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitizar (DOMPurify no client, isomorphic-dompurify no server)
import DOMPurify from "isomorphic-dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

## Bundle inflado por barrel imports

```ts
// ❌ Pode quebrar tree-shake de libs grandes
import { Icon } from "react-icons";

// ✅ Importar do subcaminho específico
import { FaUser } from "react-icons/fa";

// ✅ Next 15+ tem `optimizePackageImports` em next.config — habilitar para libs sabidas
// next.config.ts:
// experimental: { optimizePackageImports: ["lucide-react", "date-fns"] }
```

## Esquecer `<html lang>` no layout raiz

```tsx
// ❌ Lighthouse/a11y aponta; screen readers ficam em fallback
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}

// ✅
export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
```

## Confundir `redirect()` dentro de try/catch

```ts
// ❌ redirect() lança erro especial — try/catch engole, navegação não acontece
try {
  redirect("/");
} catch (e) { /* nada */ }

// ✅ redirect() FORA do try/catch (ou no final, depois do try)
const result = await doStuff();
if (!result.ok) throw new Error("failed");
redirect("/");
```

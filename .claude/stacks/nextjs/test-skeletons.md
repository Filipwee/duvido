# Skeletons de Teste — Next.js / React / TypeScript

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`
(princípios F.I.R.S.T, Given-When-Then).

## Test framework

- **Unit / Component**: Vitest + React Testing Library
- **Eventos**: `@testing-library/user-event`
- **Mocks de rede**: MSW (Mock Service Worker)
- **Coverage**: V8 (built-in Vitest)
- **E2E**: Playwright

## O que testar (por camada)

| Camada | Como testar | Quem mocka o quê |
|--------|-------------|------------------|
| Função util pura (`lib/utils.ts`) | Vitest direto, sem render | nada |
| Schema Zod | Vitest, `safeParse` com inputs válidos e inválidos | nada |
| Hook customizado (Client) | `renderHook` + RTL | timers/network se aplicável |
| Componente Client com lógica | RTL + `userEvent` | MSW para fetch interno |
| Server Component | Geralmente E2E (Playwright) — render direto é frágil | DB/API mockados via setup |
| Server Action | Chamar a função direto em Vitest com FormData fake; mockar `db` | mock do `db` |
| Route Handler | Chamar `GET`/`POST` com `Request` fake | mock do `db` |
| Fluxo completo | Playwright contra `npm run build && npm run start` | env de teste |

## Componente Client com lógica

```tsx
// src/components/transaction-form.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "./transaction-form";

describe("TransactionForm", () => {
  it("chama onSubmit com dados validados", async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/descrição/i), "Almoço");
    await userEvent.type(screen.getByLabelText(/valor/i), "45.50");
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSubmit).toHaveBeenCalledWith({ description: "Almoço", amount: 45.5 });
  });

  it("não chama onSubmit quando descrição está vazia", async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
  });
});
```

## Hook customizado

```ts
// src/hooks/use-disclosure.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "./use-disclosure";

describe("useDisclosure", () => {
  it("inicia fechado por padrão", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("alterna estado com toggle", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});
```

## Schema Zod

```ts
// src/features/transactions/schemas.test.ts
import { describe, it, expect } from "vitest";
import { transactionSchema } from "./schemas";

describe("transactionSchema", () => {
  it("aceita payload válido", () => {
    const result = transactionSchema.safeParse({
      description: "Almoço",
      amount: 45.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita valor negativo", () => {
    const result = transactionSchema.safeParse({ description: "x", amount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejeita descrição vazia", () => {
    const result = transactionSchema.safeParse({ description: "", amount: 1 });
    expect(result.success).toBe(false);
  });
});
```

## Server Action — chamando direto

```ts
// src/app/transactions/actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransaction } from "./actions";

// Mock do db — substituir pelo que o projeto usa (Prisma, Drizzle, etc.)
vi.mock("@/lib/db", () => ({
  db: {
    transaction: {
      create: vi.fn().mockResolvedValue({ id: "t1" }),
    },
  },
}));

// next/cache e next/navigation precisam ser mockados em ambiente de teste
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url) => { throw new Error(`REDIRECT:${url}`); }),
}));

describe("createTransaction action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna erro de validação quando descrição vazia", async () => {
    const formData = new FormData();
    formData.set("description", "");
    formData.set("amount", "10");

    const result = await createTransaction(null, formData);

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.errors.description).toBeDefined();
    }
  });

  it("redireciona após criar com sucesso", async () => {
    const formData = new FormData();
    formData.set("description", "Almoço");
    formData.set("amount", "45.50");

    await expect(createTransaction(null, formData)).rejects.toThrow("REDIRECT:/transactions");
  });
});
```

## Route Handler

```ts
// src/app/api/transactions/route.test.ts
import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    transaction: {
      findMany: vi.fn().mockResolvedValue([{ id: "t1", description: "X", amount: 10 }]),
      create: vi.fn().mockImplementation((args) => Promise.resolve({ id: "new", ...args.data })),
    },
  },
}));

describe("/api/transactions", () => {
  it("GET retorna lista", async () => {
    const response = await GET(new Request("http://localhost/api/transactions"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(1);
  });

  it("POST 422 quando payload inválido", async () => {
    const response = await POST(
      new Request("http://localhost/api/transactions", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(422);
  });

  it("POST 201 quando payload válido", async () => {
    const response = await POST(
      new Request("http://localhost/api/transactions", {
        method: "POST",
        body: JSON.stringify({ description: "Almoço", amount: 45.5 }),
      }),
    );
    expect(response.status).toBe(201);
  });
});
```

## Client hook com server state (TanStack Query + MSW)

Só quando o projeto realmente usa Query no client.

```tsx
// src/features/transactions/hooks.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useTransactions } from "./hooks";

const server = setupServer(
  http.get("/api/transactions", () =>
    HttpResponse.json([{ id: "1", description: "Almoço", amount: 45.5 }]),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useTransactions", () => {
  it("retorna transações do servidor", async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
```

## E2E com Playwright — fluxo crítico

```ts
// e2e/transactions.spec.ts
import { test, expect } from "@playwright/test";

test("usuário cria uma transação e vê na lista", async ({ page }) => {
  await page.goto("/transactions/new");

  await page.getByLabel(/descrição/i).fill("Café");
  await page.getByLabel(/valor/i).fill("12.50");
  await page.getByRole("button", { name: /salvar/i }).click();

  await expect(page).toHaveURL("/transactions");
  await expect(page.getByText("Café")).toBeVisible();
});

test("validação client mostra erro de descrição vazia", async ({ page }) => {
  await page.goto("/transactions/new");
  await page.getByRole("button", { name: /salvar/i }).click();
  await expect(page.getByText(/obrigatório/i)).toBeVisible();
});
```

## Comandos (na raiz do projeto)

```bash
npm run test                 # Vitest watch (Sofia em dev)
npm run test -- --run        # single run (CI / Max)
npm run test:coverage        # com cobertura V8
npm run test -- --ui         # Vitest UI

npm run e2e                  # Playwright
npm run e2e -- --headed      # ver navegador
npm run e2e -- --ui          # Playwright UI mode
```

## Cobertura mínima

| Camada | Cobertura mínima |
|--------|-----------------|
| Server Actions | 80% (paths felizes + erro de validação) |
| Route Handlers | 80% (códigos de status principais) |
| Hooks customizados | 90% |
| Funções utilitárias puras | 90% |
| Schemas Zod | 100% (válido + inválidos óbvios) |
| Componentes Client com lógica | 70% |
| Componentes puros (sem branch) | N/A — não testar |
| shadcn/ui re-exports | N/A — responsabilidade do upstream |

## O que NÃO testar

- shadcn/ui re-exports
- Componentes de apresentação puros (sem lógica)
- Integração real com DB de produção (use DB de teste em CI ou mockar)
- Server Component renderizado direto (Vitest tem suporte limitado a async server components; prefira E2E)
- Detalhes internos de `revalidatePath` / `redirect` — apenas que foram chamados

## Setup útil — testar Server Component com async

Server Components async ainda são limitados em RTL. Caminhos práticos:

1. **Preferido**: Playwright (E2E real)
2. **Alternativo**: extrair a lógica de dados para uma função pura (query layer) e testar a função; usar snapshot só do componente síncrono que recebe os dados como props
3. **Experimental**: `@testing-library/react` + `react@experimental` com `renderToString` — frágil, evitar

```ts
// ✅ Pattern recomendado: a page é fina, a query é testável
// page.tsx (não testar diretamente)
export default async function Page() {
  const data = await listTransactions();
  return <TransactionList data={data} />; // <- componente síncrono, testável
}

// queries.test.ts — testa a função pura
// transaction-list.test.tsx — testa o componente síncrono com props mockadas
```

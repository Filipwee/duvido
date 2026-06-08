# Skeletons de Teste — React / TypeScript

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`
(princípios F.I.R.S.T, Given-When-Then).

## Test framework

- **Framework**: Vitest
- **DOM rendering**: React Testing Library (RTL)
- **Eventos**: `@testing-library/user-event`
- **Mocks de rede**: MSW (Mock Service Worker)
- **Coverage**: V8 (built-in Vitest)
- **E2E (quando necessário)**: Playwright (fora do escopo padrão)

## Hook customizado

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDisclosure } from "./useDisclosure";

describe("useDisclosure", () => {
  it("inicia fechado por padrão", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("abre via open()", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });
});
```

## Componente com lógica

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "./TransactionForm";

it("envia dados válidos via onSubmit", async () => {
  const onSubmit = vi.fn();
  render(<TransactionForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/descrição/i), "Almoço");
  await userEvent.type(screen.getByLabelText(/valor/i), "45.50");
  await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

  expect(onSubmit).toHaveBeenCalledWith({ description: "Almoço", amount: 45.5 });
});
```

## Hook com server state (React Query + MSW)

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useTransactions } from "./hooks";

const server = setupServer(
  http.get("/api/v1/transactions", () =>
    HttpResponse.json([{ id: "1", description: "Almoço", amount: 45.5 }])
  )
);
beforeAll(() => server.listen());
afterAll(() => server.close());

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

it("carrega transações do servidor", async () => {
  const { result } = renderHook(() => useTransactions("user-1"), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(1);
});
```

## Schema Zod

```ts
import { describe, it, expect } from "vitest";
import { transactionSchema } from "./schemas";

describe("transactionSchema", () => {
  it("aceita payload válido", () => {
    expect(transactionSchema.safeParse({
      description: "Almoço", amount: 45.5,
    }).success).toBe(true);
  });

  it("rejeita valor negativo", () => {
    const result = transactionSchema.safeParse({ description: "x", amount: -1 });
    expect(result.success).toBe(false);
  });
});
```

## Comandos (dentro de `frontend/`)

```bash
npm run test                 # modo watch (Sofia em dev)
npm run test -- --run        # run único (CI / Max executa assim)
npm run test:coverage        # com cobertura V8
npm run test -- --ui         # Vitest UI
```

## Cobertura mínima

| Camada | Cobertura mínima |
|--------|-----------------|
| Hooks customizados | 90% |
| Funções utilitárias puras | 90% |
| Componentes com lógica | 70% |
| Componentes puros (sem branch) | N/A — não testar |
| shadcn/ui re-exports | N/A — testar é responsabilidade do upstream |

## O que testar em frontend

- Hooks customizados (lógica isolada)
- Funções utilitárias puras (formatadores, parsers)
- Componentes com branches condicionais ou que disparam callbacks
- Schemas Zod (parse de inputs inválidos)
- Stores Zustand com lógica não trivial

## O que NÃO testar

- shadcn/ui re-exports
- Componentes de apresentação puros (sem lógica, sem branch)
- Integração real com backend (E2E — usar Playwright se necessário)

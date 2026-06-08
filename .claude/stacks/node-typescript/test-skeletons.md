# Skeletons de Teste — Node.js / TypeScript / Vitest

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`.

## Test framework

- **Framework**: Vitest (default — TS nativo, rápido, ESM-first)
- **Alternativa**: Jest (se o projeto já usa) ou `node:test` (Node 20+)
- **Mocks**: `vi.fn()`, `vi.mock()` (Vitest)
- **HTTP test**: Fastify `app.inject(...)` (sem subir porta) ou supertest
- **DB**: SQLite in-memory ou Testcontainers (Postgres real para teste de integração)
- **Coverage**: V8 (built-in)

## Service (unit, com mocks)

```ts
// src/transactions/service.test.ts
import { describe, it, expect, vi } from "vitest";
import pino from "pino";

import { ResourceNotFoundError } from "../shared/errors.js";
import type { TransactionRepository } from "./repository.js";
import { TransactionService } from "./service.js";

const log = pino({ level: "silent" });

describe("TransactionService", () => {
  it("lança ResourceNotFoundError quando id não existe", async () => {
    // Given
    const repo = { findById: vi.fn().mockResolvedValue(null) } as unknown as TransactionRepository;
    const svc = new TransactionService(repo, log);

    // When / Then
    await expect(svc.findById("11111111-1111-1111-1111-111111111111"))
      .rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("cria transação e retorna o resultado", async () => {
    const expected = { id: "x", description: "y", amount: 10, createdAt: new Date().toISOString() };
    const repo = { create: vi.fn().mockResolvedValue(expected) } as unknown as TransactionRepository;
    const svc = new TransactionService(repo, log);

    const result = await svc.create({ description: "y", amount: 10, transactionDate: "2026-05-29" });
    expect(result).toEqual(expected);
  });
});
```

## Route (integração com Fastify, sem subir porta)

```ts
// src/transactions/routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";
import type { FastifyInstance } from "fastify";

describe("POST /api/v1/transactions", () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = await buildApp(); });
  afterAll(async () => { await app.close(); });

  it("retorna 201 com body válido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/transactions",
      payload: { description: "Almoço", amount: 45.5, transactionDate: "2026-05-29" },
    });
    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.description).toBe("Almoço");
  });

  it("retorna 400 quando body inválido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/transactions",
      payload: { description: "" },
    });
    expect(response.statusCode).toBe(400);
  });
});
```

## Express alternativa (com supertest)

```ts
import request from "supertest";
import { buildExpressApp } from "../app.js";

it("retorna 201", async () => {
  const app = buildExpressApp();
  const response = await request(app)
    .post("/api/v1/transactions")
    .send({ description: "x", amount: 10 });
  expect(response.status).toBe(201);
});
```

## Schema (Zod)

```ts
import { describe, it, expect } from "vitest";
import { transactionRequestSchema } from "./schemas.js";

describe("transactionRequestSchema", () => {
  it("aceita payload válido", () => {
    expect(transactionRequestSchema.safeParse({
      description: "x", amount: 10, transactionDate: "2026-05-29",
    }).success).toBe(true);
  });

  it("rejeita amount negativo", () => {
    const result = transactionRequestSchema.safeParse({
      description: "x", amount: -1, transactionDate: "2026-05-29",
    });
    expect(result.success).toBe(false);
  });
});
```

## Comandos

```bash
npm run test                 # modo watch
npm run test -- --run        # single run (CI)
npm run test:coverage        # com cobertura V8
npm run test -- routes       # filtrar por nome de arquivo
```

## Cobertura mínima

| Camada | Cobertura mínima |
|--------|-----------------|
| Service | 90% |
| Routes / handlers | 80% (via `app.inject`) |
| Repository | 70% (com DB de teste) |
| Schema (Zod) | N/A (validação via routes) |

## Regras invioláveis

- Sem `setTimeout` em teste — usa `vi.useFakeTimers()` se precisar tempo
- Sem `process.env` modificado sem cleanup — usa `vi.stubEnv()`
- Cada teste = 1 razão pra falhar
- `app.inject(...)` em vez de subir porta — testes 100× mais rápidos

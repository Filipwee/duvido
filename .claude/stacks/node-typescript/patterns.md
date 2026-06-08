# Padrões — Node.js / TypeScript

🪶 LIDO SOB DEMANDA por Lucas (backend) e Otávio.

## Repository pattern (com Prisma)

```ts
import type { PrismaClient, Transaction } from "@prisma/client";

export class TransactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.db.transaction.findUnique({ where: { id } });
  }

  async listByUser(userId: string, opts: { limit: number; offset: number }): Promise<Transaction[]> {
    return this.db.transaction.findMany({
      where: { userId },
      take: opts.limit,
      skip: opts.offset,
      orderBy: { createdAt: "desc" },
    });
  }
}
```

## Service (com injeção via constructor)

```ts
import type { Logger } from "pino";
import { ResourceNotFoundError } from "@/shared/errors.js";
import type { TransactionRepository } from "./repository.js";
import type { TransactionRequest, TransactionResponse } from "./schemas.js";

export class TransactionService {
  constructor(
    private readonly repo: TransactionRepository,
    private readonly log: Logger,
  ) {}

  async create(request: TransactionRequest): Promise<TransactionResponse> {
    this.log.info({ amount: request.amount.toString() }, "criando transação");
    const saved = await this.repo.create(request);
    return toResponse(saved);
  }

  async findById(id: string): Promise<TransactionResponse> {
    const found = await this.repo.findById(id);
    if (found === null) throw new ResourceNotFoundError(`transação não encontrada: ${id}`);
    return toResponse(found);
  }
}
```

## Fastify route + Zod schema (schema-first)

```ts
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const transactionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/transactions", {
    schema: {
      body: transactionRequestSchema,
      response: { 201: transactionResponseSchema },
    },
  }, async (req, reply) => {
    const result = await app.services.transactions.create(req.body);
    return reply.code(201).send(result);
  });

  app.get("/transactions/:id", {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      response: { 200: transactionResponseSchema },
    },
  }, async (req) => app.services.transactions.findById(req.params.id));
};
```

## Express alternativa (se não usar Fastify)

```ts
import { Router } from "express";
import asyncHandler from "express-async-handler";

export function transactionRouter(svc: TransactionService): Router {
  const router = Router();

  router.post("/transactions", asyncHandler(async (req, res) => {
    const parsed = transactionRequestSchema.parse(req.body);
    const result = await svc.create(parsed);
    res.status(201).json(result);
  }));

  return router;
}
```

> `express-async-handler` é necessário em Express porque ele não captura
> promise rejection nativamente (Fastify captura). Esquecer disso é causa
> comum de exception silenciosa em Express.

## Config validada via Zod

```ts
// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

## Error hierarchy + global handler

```ts
// shared/errors.ts
export class DomainError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class ResourceNotFoundError extends DomainError {}
export class BusinessRuleError extends DomainError {}
export class ConflictError extends DomainError {}

// Fastify error handler
app.setErrorHandler((err, req, reply) => {
  if (err instanceof ResourceNotFoundError) {
    return reply.code(404).send({ code: "NOT_FOUND", message: err.message });
  }
  if (err instanceof BusinessRuleError) {
    return reply.code(422).send({ code: "BUSINESS_RULE", message: err.message });
  }
  if (err.validation) {
    return reply.code(400).send({ code: "VALIDATION_ERROR", details: err.validation });
  }
  req.log.error({ err }, "erro inesperado");
  return reply.code(500).send({ code: "INTERNAL_ERROR", message: "erro interno" });
});
```

## Result type (alternativa a exceptions)

```ts
// Útil em fluxos onde "erro esperado" não é exception
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Uso
const result = await chargePayment(amount);
if (!result.ok) {
  log.warn({ error: result.error }, "cobrança falhou");
  return;
}
processNext(result.value);
```

Use Result quando o erro é parte do fluxo normal; exception quando é
excepcional. Não misturar os dois para a mesma operação.

## Graceful shutdown

```ts
// server.ts — sempre implementar
const server = await app.listen({ port: env.PORT, host: "0.0.0.0" });

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, "encerrando");
  await app.close();
  await db.$disconnect();   // ou pool.end() etc.
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
```

## Boundary validation — sempre parse no input externo

```ts
// ❌ Confia no body bruto — runtime quebra
app.post("/x", (req) => doStuff(req.body));

// ✅ Parse via Zod no boundary; resto do código recebe tipo seguro
app.post("/x", (req) => {
  const parsed = schemaX.parse(req.body);
  return doStuff(parsed);
});
```

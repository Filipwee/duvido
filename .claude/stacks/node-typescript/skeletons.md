# Skeletons de Código — Node.js / TypeScript

🪶 LIDO SOB DEMANDA por Lucas.

## Server entrypoint

```ts
// src/server.ts
import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = await buildApp();

const address = await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info({ address }, "server iniciado");

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, "encerrando");
  await app.close();
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
```

## App factory (Fastify)

```ts
// src/app.ts
import Fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import { env } from "./config/env.js";
import { errorHandler } from "./shared/errors.js";
import { transactionRoutes } from "./transactions/routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    bodyLimit: 1024 * 1024,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  await app.register(transactionRoutes, { prefix: "/api/v1" });

  app.get("/health", () => ({ status: "ok" }));

  return app;
}
```

## Schema (Zod)

```ts
// src/transactions/schemas.ts
import { z } from "zod";

export const transactionRequestSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),     // number na borda; Decimal interno se precisar precisão
  transactionDate: z.string().date(),       // ISO date
});

export const transactionResponseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  amount: z.number(),
  createdAt: z.string().datetime(),
});

export type TransactionRequest = z.infer<typeof transactionRequestSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
```

## Routes

```ts
// src/transactions/routes.ts
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { TransactionRepository } from "./repository.js";
import { transactionRequestSchema, transactionResponseSchema } from "./schemas.js";
import { TransactionService } from "./service.js";
import { db } from "../shared/db.js";

export const transactionRoutes: FastifyPluginAsyncZod = async (app) => {
  const svc = new TransactionService(new TransactionRepository(db), app.log);

  app.post("/transactions", {
    schema: {
      body: transactionRequestSchema,
      response: { 201: transactionResponseSchema },
    },
  }, async (req, reply) => {
    const result = await svc.create(req.body);
    return reply.code(201).send(result);
  });

  app.get("/transactions/:id", {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      response: { 200: transactionResponseSchema },
    },
  }, async (req) => svc.findById(req.params.id));
};
```

## Service

```ts
// src/transactions/service.ts
import type { Logger } from "pino";
import { ResourceNotFoundError } from "../shared/errors.js";
import type { TransactionRepository } from "./repository.js";
import type { TransactionRequest, TransactionResponse } from "./schemas.js";

export class TransactionService {
  constructor(
    private readonly repo: TransactionRepository,
    private readonly log: Logger,
  ) {}

  async create(request: TransactionRequest): Promise<TransactionResponse> {
    this.log.info({ amount: request.amount }, "criando transação");
    const saved = await this.repo.create(request);
    return saved;
  }

  async findById(id: string): Promise<TransactionResponse> {
    const found = await this.repo.findById(id);
    if (found === null) {
      throw new ResourceNotFoundError(`transação não encontrada: ${id}`);
    }
    return found;
  }
}
```

## Repository (Prisma exemplo)

```ts
// src/transactions/repository.ts
import type { PrismaClient } from "@prisma/client";
import type { TransactionRequest, TransactionResponse } from "./schemas.js";

export class TransactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(req: TransactionRequest): Promise<TransactionResponse> {
    const tx = await this.db.transaction.create({ data: req });
    return { ...tx, createdAt: tx.createdAt.toISOString() };
  }

  async findById(id: string): Promise<TransactionResponse | null> {
    const tx = await this.db.transaction.findUnique({ where: { id } });
    return tx === null ? null : { ...tx, createdAt: tx.createdAt.toISOString() };
  }
}
```

## Erros de domínio

```ts
// src/shared/errors.ts
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export class DomainError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class ResourceNotFoundError extends DomainError {}
export class BusinessRuleError extends DomainError {}
export class ConflictError extends DomainError {}

export function errorHandler(err: FastifyError, req: FastifyRequest, reply: FastifyReply): FastifyReply {
  if (err instanceof ResourceNotFoundError) {
    return reply.code(404).send({ code: "NOT_FOUND", message: err.message });
  }
  if (err instanceof BusinessRuleError) {
    return reply.code(422).send({ code: "BUSINESS_RULE", message: err.message });
  }
  if (err instanceof ConflictError) {
    return reply.code(409).send({ code: "CONFLICT", message: err.message });
  }
  if (err.validation !== undefined) {
    return reply.code(400).send({ code: "VALIDATION_ERROR", details: err.validation });
  }
  req.log.error({ err }, "erro inesperado");
  return reply.code(500).send({ code: "INTERNAL_ERROR", message: "erro interno" });
}
```

## DB client

```ts
// src/shared/db.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

export const db = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
});
```

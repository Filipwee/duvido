# Regras de Linguagem — Node.js / TypeScript

🪶 LIDO SOB DEMANDA por agentes técnicos.

## Versão e features obrigatórias

Node 20+ LTS. TypeScript strict mode obrigatório:

```ts
// tsconfig.json — base
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Use features modernas:

```ts
// ✅ Top-level await em módulos ESM
const config = await loadConfig();

// ✅ Discriminated unions
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// ✅ `satisfies` para preservar tipo concreto
const routes = {
  list: { method: "GET", path: "/transactions" },
  create: { method: "POST", path: "/transactions" },
} satisfies Record<string, RouteConfig>;

// ✅ `unknown` + narrowing, nunca `any`
function parse(input: unknown): TransactionRequest {
  return transactionSchema.parse(input);
}
```

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classe / Type / Interface | PascalCase | `TransactionService` |
| Função / método | camelCase | `findById` |
| Variável | camelCase | `totalAmount` |
| Constante | SCREAMING_SNAKE ou camelCase | `MAX_RETRIES`, `routePaths` |
| Arquivo de módulo | camelCase ou kebab-case | `transactionService.ts` ou `transaction-service.ts` |
| Diretório | kebab-case | `transactions/`, `auth-tokens/` |

> **Consistência > preferência** — escolha um padrão de arquivos (camelCase OU
> kebab-case) e use em todo o projeto. ESLint pode forçar via `unicorn/filename-case`.

## ESM ou CommonJS

Default do stack: **ESM** (`"type": "module"` no package.json + `"module": "NodeNext"`).

```ts
// ✅ ESM
import { TransactionService } from "./transactionService.js";  // extensão .js obrigatória mesmo em .ts!
export { router };

// ❌ CommonJS misturado com ESM no mesmo projeto causa caos
```

## Estrutura — package by feature

```
src/
├── server.ts                        ← entry point
├── app.ts                           ← cria Fastify/Express + plugins
├── config/
│   └── env.ts                       ← Zod-validated env
├── transactions/                    ← feature
│   ├── routes.ts                    ← endpoints
│   ├── service.ts
│   ├── repository.ts
│   ├── schemas.ts                   ← Zod
│   └── types.ts
├── shared/
│   ├── db.ts                        ← Prisma/Drizzle client
│   ├── logger.ts                    ← pino
│   ├── errors.ts                    ← classes de erro de domínio
│   └── middleware/
└── plugins/                         ← Fastify plugins (auth, cors, etc.)
```

## Regras de código

- Máximo **30 linhas** por função (JS expressivo permite menos)
- Máximo **300 linhas** por arquivo
- **Zero** `any` explícito sem comentário justificando
- **Zero** `as` cast sem narrowing antes
- **Zero** `console.log` em produção — use logger
- **Zero** `process.env.X` direto em código de domínio — use config validada
- **Sempre** valida input externo com Zod no boundary
- **Sempre** `import type { ... }` para imports só de tipo

## Async — `await` sempre, nunca floating promise

```ts
// ❌ Promise não awaitada — erro silencioso
service.save(tx);

// ✅
await service.save(tx);

// ✅ Se intencional, marca
void service.fireAndForget(tx);
```

ESLint: `@typescript-eslint/no-floating-promises` em error.

## Format de log estruturado (pino)

```ts
import pino from "pino";
const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

log.info({ id: tx.id, userId }, "transação criada");
log.error({ err, id }, "falha ao processar");  // err sempre como objeto
```

## Versionamento de API

- `/api/v1/recurso` — versão na URL
- Hook em response: header `X-API-Version`
- Marcar deprecado via OpenAPI antes de remover

## Imports — ordem (ESLint cuida)

```ts
// 1. stdlib node:
import { readFile } from "node:fs/promises";

// 2. externos
import Fastify from "fastify";
import { z } from "zod";

// 3. internos via alias
import { db } from "@/shared/db.js";

// 4. relativos
import { service } from "./service.js";
```

## Type-only imports

```ts
import type { Transaction } from "./types.js";    // ✅ apagado em compile
import { processTransaction } from "./service.js"; // valor
```

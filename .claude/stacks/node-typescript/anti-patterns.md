# Anti-Patterns — Node.js / TypeScript

🪶 LIDO SOB DEMANDA. Universais vivem em `rules/wisdom/anti-patterns.md`.

## Floating promise (não awaitada)

```ts
// ❌ Erro silencioso — UnhandledPromiseRejection mata o processo em Node 15+
service.save(tx);

// ✅ await sempre
await service.save(tx);

// ✅ Se intencional fire-and-forget, marca explicitamente
void service.audit(tx).catch(err => log.error({ err }, "audit falhou"));
```

ESLint: `@typescript-eslint/no-floating-promises` em error.

## `async` sem `await`

```ts
// ❌ async sem await — promise extra sem benefício
async function getName(user: User): Promise<string> {
  return user.name;
}

// ✅ Sync se não há await
function getName(user: User): string {
  return user.name;
}
```

## `any` explícito

```ts
// ❌
function handle(data: any) { return data.x; }

// ✅ unknown + Zod no boundary
function handle(data: unknown) {
  const parsed = schema.parse(data);
  return parsed.x;
}
```

## `process.env.X` espalhado pelo código

```ts
// ❌ Strings mágicas + sem validação + impossível mockar
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV === "prod") ...

// ✅ Config validada em um lugar (Zod)
import { env } from "@/config/env.js";
const port = env.PORT;
if (env.NODE_ENV === "production") ...
```

## Callback hell ainda hoje

```ts
// ❌ Nunca em código novo
fs.readFile(p, (err, data) => {
  if (err) return cb(err);
  parse(data, (err, parsed) => { /* ... */ });
});

// ✅ Promises (`node:fs/promises`) + async/await
import { readFile } from "node:fs/promises";
const data = await readFile(p);
const parsed = await parse(data);
```

## Express sem `asyncHandler`

```ts
// ❌ Promise rejection silenciada — request fica pendurado
app.post("/x", async (req, res) => {
  await riskyOp();   // se falha, ninguém captura
  res.send("ok");
});

// ✅ asyncHandler ou Fastify (que captura nativo)
import asyncHandler from "express-async-handler";
app.post("/x", asyncHandler(async (req, res) => { /* ... */ }));
```

## Misturar ESM e CJS

```ts
// ❌ Projeto type:"module" + require()
const lib = require("lib");   // explode

// ✅ ESM only OU CJS only — coerência
import lib from "lib";
```

## `JSON.parse` sem try/catch em input externo

```ts
// ❌ Body malformado → 500 não-tratado
const data = JSON.parse(req.body);

// ✅ Frameworks (Fastify/Express) já parseiam; nunca refazer parse manual de body
// Para outros casos (filas, arquivos), wrap + validar:
let data: unknown;
try { data = JSON.parse(raw); } catch { throw new ValidationError("JSON inválido"); }
const parsed = schema.parse(data);
```

## `eval` ou `Function(...)`

```ts
// ❌ RCE waiting to happen
eval(userInput);
new Function("return " + expression)();

// ✅ Não faz. Se precisa eval, está modelando errado.
```

## `for ... in` em array

```ts
// ❌ Itera índices como string, captura propriedades herdadas
for (const i in arr) { /* i é string! */ }

// ✅
for (const item of arr) { /* item é T */ }
for (const [i, item] of arr.entries()) { /* i é number */ }
```

## `=== undefined` vs `== null`

```ts
// ❌ Verifica só undefined, perde null
if (x === undefined) { /* ... */ }

// ✅ Quando ambos importam, == null pega os dois (única exceção ao ===)
if (x == null) { /* null OU undefined */ }
```

## Erro logado sem `err` como objeto pino

```ts
// ❌ Pino não consegue serializar — perde stack
log.error("falhou: " + err.message);

// ✅
log.error({ err, id }, "operação falhou");   // err como objeto, pino formata stack
```

## Date sem timezone

```ts
// ❌ new Date() depende do TZ do servidor — bug em produção
const now = new Date();

// ✅ UTC sempre, ou lib (date-fns/luxon) com TZ explícito
const now = new Date(); // ok se você documenta que sistema é UTC
process.env.TZ = "UTC"; // forçar no boot
```

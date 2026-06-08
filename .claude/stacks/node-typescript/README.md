# Stack `node-typescript`

🪶 Stack para backend Node.js com TypeScript (sem React).

## Linguagem / Framework

- **Linguagem**: TypeScript (strict mode)
- **Runtime**: Node.js 20+ LTS (22 quando disponível — built-in `--watch`, `node:test`)
- **Framework HTTP**: Fastify (preferido — schema-first, faster) ou Express
- **Package manager**: npm (default), pnpm (preferido se monorepo)
- **Build**: tsc + tsx (dev) / esbuild ou tsup (bundle se necessário)
- **Test**: Vitest (preferido) ou Jest
- **Lint/Format**: ESLint (flat config) + Prettier
- **Validação**: Zod (preferido) ou TypeBox (se Fastify schema-first)
- **ORM**: Prisma (DX excelente) ou Drizzle (mais leve, SQL-first)
- **Logger**: pino (rápido, estruturado)

## Quando usar

- API ou worker em Node, time familiar com JS/TS
- Edge functions ou serverless (Vercel, AWS Lambda, Cloudflare Workers)
- Quando o frontend já é TS e compartilhar tipos é desejável
- Tempo real (WebSocket/SSE) — Node é forte nisso

## Quando NÃO usar (alternativa)

- CPU-bound pesado → Go ou Java
- Sistema corporativo com transações ACID complexas e padrões maduros → `java-spring`
- Stack já é Python e o time prefere → `python-fastapi`

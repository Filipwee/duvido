# Build Reference — Node.js / TypeScript

🪶 LIDO SOB DEMANDA por Max.

## Comandos

```bash
# Toolchain
node --version    # >= 20
npm --version     # ou pnpm/yarn

# Instalar
npm install                 # ou pnpm install / yarn install
npm ci                      # CI — usa lockfile, falha se desalinhado

# Type check (sem emitir)
npm run typecheck           # tsc --noEmit

# Lint
npm run lint                # ESLint
npm run lint:fix

# Format
npm run format              # Prettier

# Testes
npm run test                # watch (dev)
npm run test -- --run       # single run (CI)
npm run test:coverage

# Dev (com hot reload)
npm run dev                 # tsx watch src/server.ts

# Build de produção
npm run build               # tsc -p tsconfig.build.json → dist/

# Rodar artefato buildado
npm start                   # node dist/server.js

# Migrations (Prisma)
npx prisma migrate dev      # cria migration + aplica
npx prisma migrate deploy   # CI/prod — só aplica
npx prisma generate         # regenera client
```

## Scripts típicos em `package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
```

## Classificação de erros TypeScript

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `Type 'X' is not assignable to type 'Y'` | Tipo incompatível | Lucas |
| `Cannot find module '@/...'` | Path alias ou import errado | Lucas |
| `Cannot find name 'X'` | Falta import | Lucas |
| `Object is possibly 'undefined'` | Sem narrowing | Lucas |
| `Type 'unknown'` | Falta parse com Zod no boundary | Lucas |
| `An import path can only end with '.js' extension` | ESM strict | Lucas (adicionar `.js` no import) |

## Classificação de erros de runtime

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `ERR_REQUIRE_ESM` | Mistura ESM/CJS | Lucas (escolher um) |
| `UnhandledPromiseRejection` | Floating promise | Lucas (await ou void) |
| `Cannot find module` em runtime | Build não emitiu, ou path errado | Max |
| `EADDRINUSE :::3000` | Porta ocupada | Max libera ou troca |
| `ENOSPC: System limit for number of file watchers reached` | Linux + tsx watch | Max aumenta `fs.inotify.max_user_watches` |

## Problemas comuns

| Problema | Solução |
|---------|---------|
| ESM strict exige `.js` em imports `.ts` | Configurar: import `./service.js` mesmo se o arquivo é `service.ts` |
| Prisma client desatualizado após mudar schema | `npx prisma generate` |
| Vitest não encontra `__dirname` em ESM | Usar `import.meta.url` + `fileURLToPath` |
| `pnpm` instalando dep transitiva como peer | Adicionar ao `.npmrc`: `auto-install-peers=true` |

## CI — exemplo (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
```

## Formato do relatório

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `npm run build`

### Resultado
✅ PASSOU | ❌ FALHOU

### Erros encontrados
1. **Arquivo**: `src/transactions/service.ts:42`
   **Erro**: `Property 'amount' does not exist on type 'unknown'`
   **Diagnóstico**: input sem parse via Zod
   **Ação**: Lucas adiciona schema.parse no boundary

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X%

### Bundle (se aplicável)
- dist/ total: XX KB

### Próximo passo
<frase>
```

# Scaffold Reference — Node.js / TypeScript

🪶 LIDO SOB DEMANDA por Bruno.

## Estrutura padrão

```
<projeto>/
├── package.json
├── package-lock.json (ou pnpm-lock.yaml | yarn.lock)
├── tsconfig.json                    ← strict mode
├── tsconfig.build.json              ← só src/, exclui tests
├── eslint.config.js                 ← flat config
├── .prettierrc
├── .gitignore                       ← node_modules, dist, .env, coverage
├── .gitattributes                   ← * text=auto eol=lf
├── .nvmrc                           ← versão do Node
├── .env.example
├── src/
│   ├── server.ts                    ← entrypoint
│   ├── app.ts                       ← factory
│   ├── config/
│   │   └── env.ts                   ← Zod-validated env
│   ├── transactions/                ← feature
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── schemas.ts
│   │   └── *.test.ts
│   ├── shared/
│   │   ├── db.ts
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── middleware/
│   └── plugins/                     ← Fastify plugins (cors, auth, etc.)
├── prisma/                          ← se usar Prisma
│   ├── schema.prisma
│   └── migrations/
├── tests/                           ← integration tests (opcional, se separados)
└── .github/workflows/ci.yml
```

## `package.json` mínimo

```json
{
  "name": "myapp",
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "fastify": "^4.27",
    "fastify-type-provider-zod": "^1.2",
    "zod": "^3.23",
    "pino": "^9.0",
    "@prisma/client": "^5.14"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "tsx": "^4.10",
    "vitest": "^1.6",
    "@vitest/coverage-v8": "^1.6",
    "prisma": "^5.14",
    "eslint": "^9.0",
    "typescript-eslint": "^7.10",
    "prettier": "^3.2",
    "@types/node": "^20.12"
  }
}
```

## `tsconfig.json` base

```json
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
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "declaration": false,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

`tsconfig.build.json` (extends + exclui tests):

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "tests"]
}
```

## `.gitignore`

```
node_modules/
dist/
coverage/
*.log
.env
.env.local
.DS_Store
.vscode/
.idea/
prisma/dev.db*
```

## Comandos para Bruno usar

```bash
node --version            # >= 20

# Criar projeto
mkdir myapp && cd myapp
npm init -y
npm pkg set type=module engines.node=">=20"

# Dependências
npm install fastify fastify-type-provider-zod zod pino @prisma/client
npm install -D typescript tsx vitest @vitest/coverage-v8 prisma \
              eslint typescript-eslint prettier @types/node

# Criar estrutura
mkdir -p src/{config,shared,transactions} tests
touch src/server.ts src/app.ts src/config/env.ts

# Init Prisma (se for usar)
npx prisma init

# Init ESLint flat config
echo "import tseslint from 'typescript-eslint';
export default tseslint.config(...tseslint.configs.strict);" > eslint.config.js
```

## Multiplataforma

- `.gitattributes`: `* text=auto eol=lf`
- `.editorconfig` opcional para padronizar indent
- UTF-8 default
- Em Windows, considerar `cross-env` para scripts que setam env vars
- Paths sempre com `/` (Node aceita em qualquer SO)

# Build Reference — Next.js / TypeScript / npm

🪶 LIDO SOB DEMANDA por Max. Comandos, classificação de erros e formato de
relatório de build para projetos Next.js.

## Comandos (na raiz do projeto Next)

```bash
# Verificar toolchain
node --version             # >= 20.x (LTS); Next 15 exige 18.18+
npm --version              # ou pnpm, yarn

# Instalar dependências
npm install                # ou pnpm install / yarn install / bun install

# Dev server (Turbopack opcional)
npm run dev                # http://localhost:3000
npm run dev -- --turbo     # Turbopack (faster, ainda em beta para build)

# Type check (sem emitir — Next compila com SWC, mas tsc valida)
npm run typecheck          # tsc --noEmit

# Lint
npm run lint               # next lint (wrapper sobre ESLint flat config)
npm run lint:fix

# Format
npm run format             # prettier --write .

# Testes unitários
npm run test               # Vitest (modo watch — Sofia em dev)
npm run test -- --run      # single-run (CI / Max)
npm run test:coverage      # com cobertura V8

# Testes E2E
npm run e2e                # Playwright (precisa do dev server rodando ou usa webServer:)
npm run e2e -- --headed    # ver o navegador

# Build de produção
npm run build              # → .next/
# Saída inclui análise: rota por rota mostra tipo (Static / Dynamic / ISR / Server)
# e tamanho de bundle por chunk.

# Rodar build localmente (não é dev — é prod-like)
npm run start              # serve o .next/ com Node em http://localhost:3000

# Análise de bundle (precisa @next/bundle-analyzer instalado)
ANALYZE=true npm run build
```

> Package manager: o stack default é `npm`. Se o projeto usa `pnpm`, `yarn`
> ou `bun`, troque o comando — restante idêntico. Lockfile do projeto define qual.

## Scripts recomendados em `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "check": "npm run typecheck && npm run lint && npm run test -- --run"
  }
}
```

`npm run check` é o "gate" mínimo que Max pede antes de deploy.

## Classificação de erros TypeScript

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `Type 'X' is not assignable to type 'Y'` | Tipo incompatível | Renata |
| `Cannot find module '@/...'` | Path alias errado em `tsconfig.json` | Renata (ou Bruno se scaffold) |
| `Property 'X' does not exist on type 'PageProps'` | Tipagem de `params`/`searchParams` desatualizada (Next 15: Promise) | Renata |
| `Type 'Promise<...>' is missing the following properties from type` | Esqueceu `await` em `params` (Next 15+) | Renata |
| `'use client' must be at the top of the file` | Diretiva no lugar errado | Renata |
| `Module not found: Can't resolve 'fs'` (em Client Component) | Importou código server em client | Renata (move pro server ou usa `import "server-only"`) |

## Classificação de erros de build/runtime Next

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `Error: Page "X" is missing exported function` | Faltou `export default` no `page.tsx` | Renata |
| `Error: Route "X" exports an async function but is not a Server Component` | Componente client tentando ser async (não permitido) | Renata |
| `You're importing a component that needs useState. It only works in a Client Component` | Esqueceu `"use client"` | Renata |
| `Dynamic server usage: cookies()` | Usou `cookies()` em rota estática — força dynamic | Renata (ou intencional) |
| `Module not found: Can't resolve '...'` | Falta dependência | Max (`npm install`) |
| `ENOSPC: System limit for file watchers reached` (Linux) | Limite de watchers do kernel | Max ajusta `fs.inotify.max_user_watches` |
| `EADDRINUSE: address already in use :::3000` | Porta 3000 ocupada | Max libera ou `PORT=3001 npm run dev` |
| `next/image Un-configured Host` | Domínio remoto não está em `images.remotePatterns` | Renata edita `next.config.ts` |
| `Cannot read properties of undefined (reading 'env')` | Acesso a env no client sem prefixo `NEXT_PUBLIC_` | Renata |
| `Hydration failed because the initial UI does not match what was rendered on the server` | Diferença SSR vs CSR (usou `Date.now()`, `Math.random()`, `localStorage` no render) | Renata move pra `useEffect` ou usa `suppressHydrationWarning` consciente |
| `Error: Invariant: revalidatePath/Tag must be called within a Server Action` | Chamou em Server Component (não permitido) | Renata move pra action |

## Problemas comuns no ambiente

| Problema | Solução |
|---------|---------|
| Hot reload lento no Windows | Habilitar Turbopack: `next dev --turbo` |
| Build estoura memória | `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| Tailwind classes não aplicam | Verificar `content:` no `tailwind.config.ts` inclui `src/**/*.{ts,tsx}` e `src/app/**/*.{ts,tsx}` |
| Next dev acessa `/_next` 404 atrás de proxy | Reverse proxy deve passar `/_next/*` sem reescrever |
| Build OK local mas falha no CI | Geralmente env var faltando: garantir todos `NEXT_PUBLIC_*` no CI |
| ESLint config quebra após upgrade | `eslint-config-next` requer ESLint 8.57+; em 9, usar flat config |

## Sobre o `app/` vs `pages/`

Next ainda suporta `pages/` (Pages Router) por compatibilidade. **Este stack
assume App Router apenas**. Se o projeto tem `pages/` legado, Sergio decide via
ADR se migra ou mantém coexistência.

## CI — exemplo de workflow (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
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
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          # Outras envs sensíveis viram secret do repo
  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run e2e
```

## Deploy — opções e quem opera (Téo)

| Plataforma | Comando / Como | Quando |
|-----------|---------------|--------|
| **Vercel** (canônico) | `vercel` CLI ou push em branch conectado | Default; SSR/ISR/Edge funcionam nativamente |
| **Cloudflare Pages** | `@cloudflare/next-on-pages` adapter + `wrangler pages deploy` | Quer CDN global e free tier generoso |
| **AWS / GCP / self-hosted** | `npm run build && npm run start` em container Node | Quer controle, dado regulado, custos previsíveis |
| **Static export** | `output: "export"` em `next.config.ts` → `out/` estático | App 100% estático, sem Server Action / SSR |

Em todos os casos, Téo valida: env vars setadas, build verde, smoke test em
preview URL antes de promover a produção.

## Formato do relatório de build (Max usa)

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `npm run build`

### Resultado
✅ PASSOU | ❌ FALHOU

### Erros encontrados
1. **Arquivo**: `src/app/transactions/page.tsx:12`
   **Erro**: `Property 'id' does not exist on type 'Promise<{ id: string }>'`
   **Diagnóstico**: faltou `await params` (Next 15+)
   **Ação**: Renata adiciona `const { id } = await params;`

### Análise de rotas (saída do `next build`)
- /                     ○ Static          1.2 KB | 92 KB First Load
- /transactions         ƒ Dynamic         3.4 KB | 105 KB First Load
- /transactions/[id]    ƒ Dynamic         4.1 KB | 106 KB First Load
- /api/webhooks/stripe  ƒ Dynamic (route handler)

Legenda: ○ static | ● SSG | ƒ dynamic | ◐ ISR | ⚡ edge

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X%

### Bundle (após build)
- First Load JS shared: XX KB (alvo: < 100 KB)
- Maior rota: <rota> — YY KB
- Lib mais pesada no client: <nome> — ZZ KB
- Alvo geral: < 200 KB total por rota

### Próximo passo
<frase clara>
```

## Bundle budget (alvo padrão deste stack)

| Métrica | Alvo |
|---------|------|
| First Load JS shared | < 100 KB |
| First Load JS por rota | < 200 KB |
| Image LCP (otimizada) | < 100 KB |
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Acessibilidade | ≥ 90 |
| TTFB (Vercel SSR) | < 600ms |

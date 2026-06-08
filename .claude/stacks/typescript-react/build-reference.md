# Build Reference — TypeScript / Vite / npm

🪶 LIDO SOB DEMANDA por Max. Comandos, classificação de erros e formato de
relatório.

## Comandos (dentro de `frontend/` ou root, conforme estrutura)

```bash
# Verificar versão da toolchain
node --version
npm --version    # ou pnpm --version

# Instalar dependências
npm install                       # ou: pnpm install / yarn install

# Type check (sem emitir)
npm run typecheck                 # tsc --noEmit

# Lint
npm run lint                      # ESLint
npm run lint:fix                  # ESLint --fix

# Format
npm run format                    # Prettier --write

# Testes (single run, para CI/Max)
npm run test -- --run

# Testes em modo watch (dev/Sofia)
npm run test

# Testes com cobertura
npm run test:coverage

# Build de produção
npm run build                     # → dist/

# Preview do build
npm run preview

# Dev server (modo desenvolvimento)
npm run dev                       # http://localhost:5173
```

> **Sobre o package manager:** o stack default é `npm`. Se o projeto usa
> `pnpm` ou `yarn`, troque o comando — o resto é idêntico. Lockfile do
> projeto (`package-lock.json` | `pnpm-lock.yaml` | `yarn.lock`) define qual.

## Classificação de erros TypeScript

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `Type 'X' is not assignable to type 'Y'` | Tipo incompatível | Renata |
| `Cannot find module '@/...'` | Path alias ou import errado | Renata |
| `is declared but its value is never read` | Import/var não usado | Renata |
| `Property 'X' does not exist on type 'Y'` | DTO desalinhado com back | Renata (alinha com Lucas/contrato) |
| `Object is possibly 'null' \| 'undefined'` | Falta narrowing | Renata |
| `Type instantiation is excessively deep` | Generics recursivos demais | Renata (simplificar) |

## Classificação de erros de build/runtime

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `ENOENT: no such file or directory, open 'package.json'` | Pasta errada | Max (rodar dentro de `frontend/`) |
| `EACCES` ou `EPERM` em `node_modules` | Permissão / antivírus Windows | Usuário |
| `EADDRINUSE: address already in use :::5173` | Porta Vite ocupada | Max libera ou troca porta |
| `Module not found: ... in 'node_modules'` | Falta dependência | Max roda `npm install` |
| `npm ERR! peer dep missing` | Conflito de peer dependency | Max ajusta versão ou usa `--legacy-peer-deps` |
| `Cannot find type definition file for 'X'` | Falta `@types/X` | Max instala types |

## Problemas comuns no ambiente

| Problema | Solução |
|---------|---------|
| Vite hot reload não atualiza no Windows | `server.watch.usePolling: true` em `vite.config.ts` |
| Build estoura memória | `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| Tailwind classes não aplicam | Verificar `content:` do `tailwind.config.ts` |
| ESLint conflita com Prettier | Adicionar `eslint-config-prettier` ao extends, por último |

## CI — exemplo de workflow (GitHub Actions)

```yaml
name: ci-frontend
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
```

## Formato do relatório de build (Max usa)

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `npm run build`

### Resultado
✅ PASSOU | ❌ FALHOU

### Erros encontrados
1. **Arquivo**: `src/features/transactions/hooks.ts:42`
   **Erro**: `Type 'Transaction[]' is not assignable to 'TransactionResponse[]'`
   **Diagnóstico**: shape do DTO mudou no backend; types.ts desalinhado
   **Ação**: Renata realinha types.ts com Controller do backend

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X%

### Bundle (após build)
- Tamanho total gzip: XXX KB
- Maior chunk: <nome> — YY KB
- Alvo: < 300 KB gzip inicial

### Próximo passo
<frase clara>
```

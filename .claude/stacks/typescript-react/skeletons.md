# Skeletons de Código — React / TypeScript

🪶 LIDO SOB DEMANDA por Renata. Complementa `language-rules.md`, `patterns.md`, `anti-patterns.md`.

## Stack padrão do projeto

| Camada | Ferramenta |
|--------|-----------|
| Build | Vite |
| Linguagem | TypeScript (strict mode) |
| Framework | React 18+ |
| Estilização | Tailwind CSS + shadcn/ui |
| Roteamento | React Router v6+ |
| Server state | TanStack Query (React Query) |
| Client state | Zustand (quando necessário; Context para casos simples) |
| Forms | React Hook Form + Zod |
| HTTP | Axios (com interceptors para JWT) |
| Testes | Vitest + React Testing Library |
| Lint | ESLint + Prettier |

## Estrutura padrão de `frontend/`

```
frontend/
├── src/
│   ├── main.tsx                     ← bootstrap
│   ├── App.tsx                      ← rotas principais
│   ├── routes/                      ← páginas (1 pasta por rota)
│   │   ├── transactions/
│   │   │   ├── TransactionsPage.tsx
│   │   │   └── components/          ← componentes locais da rota
│   ├── components/                  ← componentes compartilhados
│   │   ├── ui/                      ← shadcn/ui (button, input, dialog...)
│   │   └── layout/                  ← Header, Sidebar, etc.
│   ├── features/                    ← lógica por domínio (não é UI)
│   │   ├── transactions/
│   │   │   ├── api.ts               ← chamadas axios
│   │   │   ├── hooks.ts             ← useTransactions, useCreateTransaction
│   │   │   ├── types.ts             ← tipos (espelho dos DTOs do back)
│   │   │   └── schemas.ts           ← validação Zod
│   ├── lib/                         ← utils compartilhados
│   │   ├── axios.ts                 ← instância configurada
│   │   ├── queryClient.ts           ← config do TanStack Query
│   │   └── utils.ts                 ← cn(), formatadores
│   ├── hooks/                       ← hooks genéricos (useDebounce, useMediaQuery)
│   ├── stores/                      ← Zustand (auth, theme, etc.)
│   └── types/                       ← tipos globais
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── .eslintrc.cjs
```

## Padrões obrigatórios

### Componente funcional + tipos explícitos
```tsx
type TransactionItemProps = {
  transaction: Transaction;
  onEdit?: (id: string) => void;
};

export function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  return (
    <article className="rounded-lg border p-4 hover:bg-muted/50">
      <h3 className="font-medium">{transaction.description}</h3>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(transaction.amount)}
      </p>
      {onEdit && (
        <Button variant="ghost" onClick={() => onEdit(transaction.id)}>
          Editar
        </Button>
      )}
    </article>
  );
}
```

### Hook de feature (server state com React Query)
```ts
// features/transactions/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Transaction, TransactionRequest } from "./types";

const KEY = ["transactions"] as const;

export function useTransactions(userId: string) {
  return useQuery({
    queryKey: [...KEY, userId],
    queryFn: () => api.list(userId),
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionRequest) => api.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
```

### API client (axios isolado por feature)
```ts
// features/transactions/api.ts
import { http } from "@/lib/axios";
import type { Transaction, TransactionRequest } from "./types";

export const api = {
  list: (userId: string) =>
    http.get<Transaction[]>("/api/v1/transactions", { params: { userId } })
      .then(r => r.data),

  create: (data: TransactionRequest) =>
    http.post<Transaction>("/api/v1/transactions", data).then(r => r.data),

  delete: (id: string) =>
    http.delete(`/api/v1/transactions/${id}`).then(r => r.data),
};
```

### Form com React Hook Form + Zod
```tsx
const schema = z.object({
  description: z.string().min(1, "obrigatório").max(200),
  amount: z.coerce.number().positive("deve ser positivo"),
});
type FormData = z.infer<typeof schema>;

export function TransactionForm({ onSubmit }: { onSubmit: (d: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("description")} aria-invalid={!!errors.description} />
      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

### Tipos que espelham DTOs do back
```ts
// features/transactions/types.ts
// Espelho do contrato do backend (independente da linguagem)
export type Transaction = {
  id: string;          // UUID vem como string no JSON
  userId: string;
  description: string;
  amount: number;      // BigDecimal vira number no JSON
  status: TransactionStatus;
  transactionDate: string;  // LocalDate vira ISO string
  createdAt: string;
};

export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TransactionRequest = {
  description: string;
  amount: number;
  transactionDate: string;
};
```

## Integração com backend

| Backend tipo | Frontend (TS) |
|----------------|---------------|
| `UUID` | `string` |
| `BigDecimal` | `number` (cuidado precisão — use `Decimal.js` se monetário pesado) |
| `LocalDate` | `string` ISO `"2026-05-26"` |
| `LocalDateTime` | `string` ISO `"2026-05-26T01:40:00"` |
| `Instant` | `string` ISO com `Z` |
| `Enum` Java | `"VALUE1" \| "VALUE2"` union literal |
| `Page<T>` | `{ content: T[], totalElements: number, totalPages: number, ... }` |
| Bean Validation error | `{ code: "VALIDATION_ERROR", message: string[] }` |

CORS: o backend deve permitir `http://localhost:5173` (porta padrão Vite) em dev.
Em produção: mesmo origin (servido pelo Spring) ou domínio configurado.

## Comandos npm/pnpm que Renata usa

```bash
# Dentro de frontend/
npm install              # ou pnpm install
npm run dev              # Vite dev server (porta 5173)
npm run build            # Build produção (saída em dist/)
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run test             # Vitest
npm run test:ui          # Vitest com UI
npm run typecheck        # tsc --noEmit

# Adicionar componente shadcn
npx shadcn@latest add button input dialog form
```

## Acessibilidade (a11y) — checklist mínima

- [ ] HTML semântico: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`
- [ ] Heading hierarchy: 1× `<h1>` por página, sem pular níveis
- [ ] Foco visível: nunca `outline: none` sem alternativa
- [ ] Contraste WCAG AA: 4.5:1 texto normal, 3:1 texto grande
- [ ] Navegação por teclado: Tab funciona em ordem lógica
- [ ] ARIA quando HTML não basta: `role`, `aria-label`, `aria-live`
- [ ] Forms: cada input com `<label>`, erros vinculados via `aria-describedby`

## Performance — boas práticas

- **Code splitting**: `lazy()` + `<Suspense>` em rotas
- **Memoização**: `React.memo`, `useMemo`, `useCallback` SÓ se profiler mostrar gargalo real
- **Lista grande (>100 itens)**: virtualização (TanStack Virtual)
- **Imagens**: `loading="lazy"`, formato moderno (WebP/AVIF)
- **Bundle**: `npm run build` reporta size; alvo < 300KB gzip inicial

# Regras de Linguagem — TypeScript + React

🪶 LIDO SOB DEMANDA por Renata (frontend). Convenções da linguagem e do React.

## TypeScript — configuração estrita

`tsconfig.json` obrigatório:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Componente | PascalCase | `TransactionList.tsx` |
| Hook | camelCase com prefixo `use` | `useTransactions` |
| Tipo / Interface | PascalCase | `type Transaction`, `interface UserProps` |
| Constante | SCREAMING_SNAKE ou camelCase | `MAX_RETRIES`, `routePaths` |
| Arquivo de componente | `PascalCase.tsx` | `TransactionForm.tsx` |
| Arquivo utilitário | `camelCase.ts` | `formatCurrency.ts` |
| Hook em arquivo próprio | `useNome.ts` | `useDebounce.ts` |

## Type vs Interface

Padrão do projeto: **`type` é o default**. Use `interface` apenas para:
- Contratos públicos extensíveis por consumidores
- Quando precisa de `declaration merging`

```ts
// ✅ Padrão — type
type Transaction = {
  id: string;
  amount: number;
};

// ✅ Tipos derivados / utility types
type TransactionRequest = Omit<Transaction, "id" | "createdAt">;
type TransactionStatus = Transaction["status"];

// ✅ Union literal em vez de enum
type Role = "ADMIN" | "USER" | "GUEST";
```

## Evite `any` — alternativas

```ts
// ❌ Perde toda a type-safety
function handle(data: any) { return data.something; }

// ✅ unknown + narrowing
function handle(data: unknown) {
  if (typeof data === "object" && data !== null && "something" in data) {
    return (data as { something: string }).something;
  }
}

// ✅ Generic
function identity<T>(value: T): T { return value; }

// ✅ Tipos derivados de runtime (Zod)
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;
```

## React — Componente funcional padrão

```tsx
// ✅ Tipo nas props, default export apenas em routes/pages
type ButtonProps = {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ variant = "primary", children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-4 py-2",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground"
      )}
    >
      {children}
    </button>
  );
}
```

## Imports — ordem e alias

```ts
// 1. Externos
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internos via alias @/
import { Button } from "@/components/ui/button";
import { http } from "@/lib/axios";

// 3. Relativos (mesma feature)
import { TransactionItem } from "./TransactionItem";
import type { Transaction } from "./types";
```

Use `import type` para imports puramente de tipo — ajuda no tree-shaking.

## React Hooks — regras

```tsx
// ✅ Dependency array completa
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ Cleanup quando aplicável
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

// ❌ Evitar — efeito para data fetching (use React Query)
useEffect(() => {
  fetch("/api/data").then(r => r.json()).then(setData);
}, []);

// ✅ Hook customizado quando lógica repete
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

## Forms — React Hook Form + Zod

```tsx
const schema = z.object({
  email: z.string().email("email inválido"),
  password: z.string().min(8, "mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onLogin)} noValidate>
      <Input {...register("email")} type="email" aria-invalid={!!errors.email} />
      {/* ... */}
    </form>
  );
}
```

## React Query — keys e mutações

```ts
// ✅ Query key como const tupla
const TRANSACTIONS_KEY = ["transactions"] as const;

// ✅ Hierarquia de keys
const keys = {
  all: ["transactions"] as const,
  lists: () => [...keys.all, "list"] as const,
  list: (filters: Filters) => [...keys.lists(), filters] as const,
  details: () => [...keys.all, "detail"] as const,
  detail: (id: string) => [...keys.details(), id] as const,
};

// ✅ Invalidação granular após mutation
onSuccess: () => qc.invalidateQueries({ queryKey: keys.lists() })
```

## Tailwind — convenções

```tsx
// ✅ Use `cn()` para classes condicionais (utility de clsx + tailwind-merge)
import { cn } from "@/lib/utils";

<div className={cn("p-4 rounded", isActive && "bg-primary", className)}>

// ❌ Evitar — string concatenada quebra IntelliSense e tree-shake do Tailwind
<div className={"p-4 " + (isActive ? "bg-primary" : "")}>

// ✅ Classes longas — multi-line com cn
<button className={cn(
  "inline-flex items-center justify-center",
  "rounded-md px-4 py-2 text-sm font-medium",
  "hover:bg-accent disabled:opacity-50",
)}>
```

Nunca usar `@apply` em arquivos CSS para "componentizar" — extraia o componente em vez disso.

## ESLint + Prettier — base do projeto

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

## Variáveis de ambiente — Vite

```ts
// ❌ Não confundir process.env (Node) com import.meta.env (Vite)
process.env.API_URL  // não funciona em build

// ✅ Vite — prefixo VITE_ obrigatório para exposição no client
import.meta.env.VITE_API_URL

// .env.local (não commitado)
VITE_API_URL=http://localhost:8080

// Tipo do env
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

## Diferenças importantes em relação ao Java

| Java | TypeScript |
|------|-----------|
| `null` checado com `Optional` | `null \| undefined`, narrowing com `if` |
| `final` | `const` (mas só rebind, não imutabilidade profunda) |
| `enum` real | union de literais `"A" \| "B"` (preferido) ou `enum` (evitar) |
| `equals()` em classes | comparação por referência para objetos — use libs (lodash) ou shape |
| Generics com `extends T` | `<T extends U>` — mesma sintaxe |
| `void` retorno | `void` ou ausência |
| Sealed class | discriminated unions |

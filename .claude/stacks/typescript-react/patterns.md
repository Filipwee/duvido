# Padrões — React / TypeScript

🪶 LIDO SOB DEMANDA por Renata (escrever) e Otávio (revisar).

> Princípios universais vivem em `rules/wisdom/`. Aqui apenas o que é específico do React.

## Composição sobre configuração

```tsx
// ❌ Componente "configurável" com 15 props
<Card
  title="..."
  showHeader
  showFooter
  footerActions={[...]}
  headerColor="blue"
  // ... segue infinitamente
/>

// ✅ Composição — cada slot é um componente
<Card>
  <Card.Header className="bg-blue-500">Título</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>
    <Button>Salvar</Button>
  </Card.Footer>
</Card>
```

## Separação: Server State vs Client State

```tsx
// ❌ Misturar data do servidor com state local
function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then(r => r.json())
      .then(setTransactions)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  // sem cache, sem revalidação, sem retry, sem dedupe...
}

// ✅ Server state via React Query, UI state via useState
function TransactionList() {
  const [filter, setFilter] = useState("");           // ← UI state
  const { data, isLoading, error } = useTransactions(filter); // ← server state
  // cache, revalidação, retry, dedupe — tudo de graça
}
```

## Container/Presenter (quando ajuda)

```tsx
// Componente "burro" — recebe props, renderiza, dispara callbacks
type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};
export function TransactionListView({ transactions, onDelete }: Props) {
  return <ul>{transactions.map(t => <TransactionItem key={t.id} {...t} onDelete={onDelete} />)}</ul>;
}

// Container — orquestra dados e ações
export function TransactionListContainer() {
  const { data = [] } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  return <TransactionListView transactions={data} onDelete={deleteMutation.mutate} />;
}
```

Use container/presenter quando o componente apresentar valor isolado (testes, Storybook, reuso).
**Não force a separação** se o componente é simples — over-engineering.

## Custom hooks — extraia quando

```tsx
// ❌ Lógica repetida em vários componentes
function ComponentA() {
  const [open, setOpen] = useState(false);
  // ... manipulação
}
function ComponentB() {
  const [open, setOpen] = useState(false);
  // ... mesma manipulação
}

// ✅ Hook customizado
function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  return { isOpen, open, close, toggle };
}
```

## Anti-padrões frequentes

### Estado derivado em useState
```tsx
// ❌ Estado que é função de outro estado
const [items, setItems] = useState<Item[]>([]);
const [count, setCount] = useState(0);
useEffect(() => setCount(items.length), [items]);

// ✅ Calcule no render
const [items, setItems] = useState<Item[]>([]);
const count = items.length;  // pronto

// ✅ Se cálculo for caro, useMemo
const expensive = useMemo(() => heavyCompute(items), [items]);
```

### Key como index em lista mutável
```tsx
// ❌ Index como key quando lista pode reordenar/remover
{items.map((item, idx) => <Item key={idx} {...item} />)}

// ✅ ID estável
{items.map(item => <Item key={item.id} {...item} />)}
```

### Prop drilling > 2 níveis
```tsx
// ❌ Passando user por 4 níveis
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />

// ✅ Context (se muitos componentes leem) ou Zustand (se houve mutação)
const { user } = useAuth();
```

### useEffect para sincronizar estado
```tsx
// ❌ Effect para "atualizar quando prop muda"
const [internal, setInternal] = useState(prop);
useEffect(() => setInternal(prop), [prop]);

// ✅ Use o prop direto, ou derive via key reset
<Component key={prop.id} />  // remonta quando id muda
```

### Renderização condicional com `&&` em número
```tsx
// ❌ Se count = 0, renderiza "0" literal na tela
{count && <div>{count}</div>}

// ✅ Boolean explícito
{count > 0 && <div>{count}</div>}
{!!count && <div>{count}</div>}
```

### `onClick` em `<div>`
```tsx
// ❌ Inacessível para teclado/screen reader
<div onClick={handleClick}>Clique</div>

// ✅ Elemento semântico correto
<button type="button" onClick={handleClick}>Clique</button>

// ✅ Se precisar mesmo de div clicável, role + keyboard
<div role="button" tabIndex={0} onClick={handleClick} onKeyDown={onKeyEnter}>
```

## Performance — quando memoizar

```tsx
// Não memoize por hábito. Só quando profiler mostrar gargalo.

// ✅ React.memo — componente caro, renderizado muitas vezes com props iguais
export const HeavyChart = React.memo(function HeavyChart({ data }: Props) {
  // render caro
});

// ✅ useMemo — cálculo caro
const sorted = useMemo(() => bigArray.sort(comparator), [bigArray]);

// ✅ useCallback — função passada para componente memoizado
const handleClick = useCallback((id: string) => doThing(id), [doThing]);

// ❌ Memoizar tudo "por garantia"
const value = useMemo(() => a + b, [a, b]); // primitivo cheap, useMemo custa mais que o cálculo
```

## Erros e loading

```tsx
// ✅ Estados explícitos via React Query
const { data, isLoading, isError, error } = useTransactions();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data?.length) return <EmptyState />;
return <TransactionList items={data} />;

// ✅ Error Boundary para erros não capturados
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## Acessibilidade — padrões frequentes

```tsx
// ✅ Botão de ícone — sempre aria-label
<button aria-label="Fechar">
  <XIcon />
</button>

// ✅ Loading anunciado a screen reader
<div role="status" aria-live="polite">
  {isLoading ? "Carregando transações..." : `${count} transações carregadas`}
</div>

// ✅ Modal — foco e escape
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  {/* shadcn já cuida de focus trap, escape, aria-modal */}
</Dialog>

// ✅ Skip link no início do layout
<a href="#main" className="sr-only focus:not-sr-only">Pular para o conteúdo</a>
```

## Code splitting

```tsx
// ✅ Rota pesada — lazy
import { lazy, Suspense } from "react";

const ReportsPage = lazy(() => import("./routes/reports/ReportsPage"));

<Route path="/reports" element={
  <Suspense fallback={<PageSkeleton />}>
    <ReportsPage />
  </Suspense>
} />
```

## Definition of Done — entrega de UI

- [ ] Componente compila sem erro de TS (`npm run typecheck`)
- [ ] ESLint zero warning (`npm run lint`)
- [ ] Build produção passa (`npm run build`)
- [ ] Testes Vitest verdes para hooks/lógica complexa
- [ ] Tab navega na ordem lógica
- [ ] Contraste mínimo WCAG AA verificado
- [ ] Loading state visível
- [ ] Error state visível
- [ ] Empty state visível
- [ ] Mobile (375px) e desktop (1280px) verificados

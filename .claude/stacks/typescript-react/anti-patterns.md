# Anti-Patterns — React / TypeScript

🪶 LIDO SOB DEMANDA por Renata (escrever) e Otávio (revisar).

> Universais vivem em `rules/wisdom/anti-patterns.md`. Aqui apenas o que é
> específico de React/TS. Padrões positivos vivem em `patterns.md`; este arquivo
> é o catálogo de footguns.

## `any` explícito

```ts
// ❌ Perde toda a type-safety
function handle(data: any) { return data.something; }

// ✅ unknown + narrowing
function handle(data: unknown) {
  if (typeof data === "object" && data !== null && "something" in data) {
    return (data as { something: string }).something;
  }
}
```

## `useEffect` para data fetching

```tsx
// ❌ Sem cache, sem revalidação, sem retry, sem dedupe
useEffect(() => {
  fetch("/api/data").then(r => r.json()).then(setData);
}, []);

// ✅ React Query
const { data, isLoading } = useQuery({ queryKey: ["data"], queryFn: fetchData });
```

## Estado derivado em `useState`

```tsx
// ❌ Estado que é função de outro estado
const [items, setItems] = useState<Item[]>([]);
const [count, setCount] = useState(0);
useEffect(() => setCount(items.length), [items]);

// ✅ Calcule no render (cheap) ou useMemo (caro)
const count = items.length;
const sorted = useMemo(() => bigArray.sort(comparator), [bigArray]);
```

## `index` como key em lista mutável

```tsx
// ❌ Lista que reordena/remove com index → React reconcilia errado
{items.map((item, idx) => <Item key={idx} {...item} />)}

// ✅ ID estável
{items.map(item => <Item key={item.id} {...item} />)}
```

## Renderização condicional com `&&` em número

```tsx
// ❌ Se count = 0, renderiza "0" literal na tela
{count && <div>{count}</div>}

// ✅ Boolean explícito
{count > 0 && <div>{count}</div>}
```

## `onClick` em `<div>`

```tsx
// ❌ Inacessível para teclado/screen reader
<div onClick={handleClick}>Clique</div>

// ✅ Elemento semântico correto
<button type="button" onClick={handleClick}>Clique</button>
```

## `localStorage` para JWT

```ts
// ❌ XSS rouba o token
localStorage.setItem("token", jwt);

// ✅ httpOnly cookie (combinar com backend) — preferido
//    ou memória (Zustand sem persist) se o login é por sessão curta
```

## Prop drilling além de 2 níveis

```tsx
// ❌ Passando user por 4 níveis
<App user={user}><Layout user={user}><Sidebar user={user}><UserMenu user={user} />

// ✅ Context (se muitos leem) ou Zustand (se há mutação)
const { user } = useAuth();
```

## `useEffect` para sincronizar prop em state

```tsx
// ❌ Effect para "atualizar quando prop muda"
const [internal, setInternal] = useState(prop);
useEffect(() => setInternal(prop), [prop]);

// ✅ Use o prop direto, ou derive via key reset
<Component key={prop.id} />
```

## Bundle inflado por imports gigantes

```ts
// ❌ Importa lib inteira
import _ from "lodash";

// ✅ Só o que usa (tree-shake)
import debounce from "lodash/debounce";

// ✅ Melhor ainda: usa o nativo se equivalente
const debounced = (() => { /* ... */ })();
```

## `dangerouslySetInnerHTML` sem sanitização

```tsx
// ❌ XSS imediato
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sanitize via DOMPurify, ou usa Markdown render seguro
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

## Imagens sem `alt`

```tsx
// ❌ Inacessível a screen readers
<img src="logo.png" />

// ✅ Sempre alt; decorativa usa string vazia
<img src="logo.png" alt="Logo da empresa" />
<img src="separator.png" alt="" />  // decorativa
```

## Memoizar tudo "por garantia"

```tsx
// ❌ Memoização que custa mais que o cálculo
const value = useMemo(() => a + b, [a, b]);  // primitivos, cheap

// ✅ Memoize só quando profiler mostrar gargalo real
const sorted = useMemo(() => bigArray.sort(comparator), [bigArray]);
```

# Preguntas posibles — live coding + quiz

Bullets con **pregunta + respuesta esperada** para entrevistas Senior RN. Orientado a hooks, closures, mutabilidad, render, async, event loop, listas, estado y performance — no LeetCode.

**Distribución típica (quiz US):** ~40% React/RN · ~30% JS · ~20% TS · ~10% arquitectura/performance.

---

## React: ¿Qué imprime?

```tsx
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
  }, []);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### ¿Qué imprime?

- Al montar: **`0`** (una vez).
- Al hacer click: **no imprime de nuevo** (el effect no se re-ejecuta).

### ¿Por qué?

- `useEffect` con **`[]`** corre solo después del **primer** commit.
- El closure del effect capturó `count` del **render #1** → siempre ve `0` dentro del effect (stale closure).
- Los clicks sí actualizan UI (`setCount`), pero el effect no vuelve a correr.

### ¿Qué problema tiene?

- **Stale closure** — lógica en el effect desincronizada del state actual.
- Si el intent era loguear cada cambio: faltan **`count`** en las deps → `[count]`.
- Si el intent era correr solo al mount pero usar valor fresco: ref o reestructurar la lógica.

---

## Detectar el bug

```tsx
const [user, setUser] = useState({
  name: 'John',
  age: 30
});

function updateAge() {
  user.age = 31;
  setUser(user);
}
```

### ¿Por qué no rerenderiza?

- **Mutación in-place** del mismo objeto; la **referencia** de `user` no cambia.
- `useState` compara con `Object.is` — misma referencia → React asume que no hubo cambio → **no re-render**.

### ¿Cómo lo arreglarías?

```tsx
setUser({ ...user, age: 31 });
// o
setUser(prev => ({ ...prev, age: 31 }));
```

- Siempre **inmutabilidad**: nuevo objeto/array para disparar update.

---

## useEffect

```tsx
useEffect(() => {
  fetchUsers();
}, [fetchUsers]);
```

### ¿Cuándo puede generar un loop?

- Si `fetchUsers` es una **función nueva en cada render** (declarada en el componente sin `useCallback`) → referencia cambia → effect corre → setState → render → nueva `fetchUsers` → loop.

### ¿Cómo lo evitarías?

- `useCallback` estable para `fetchUsers` con deps correctas.
- O **no** poner la función en deps: llamar fetch inline en el effect y deps `[userId]` / `[]` según el caso.
- O mover fetch a **TanStack Query** / capa fuera del componente.
- Regla: deps = todo lo que el effect **lee** del render y que puede cambiar.

---

## useMemo vs useCallback (teórico)

### useMemo

- Memoriza un **valor** (resultado de un cálculo).
- Cuando: cálculo **costoso**, crear objeto/array estable para props de hijo `React.memo`, evitar recalcular en cada render.

### useCallback

- Memoriza una **función** (misma referencia entre renders).
- Cuando: pasar callback a hijo memoizado, o como dep de `useEffect` sin re-disparar en cada render.

### Qué problema resuelven

- Evitar **trabajo repetido** (useMemo) y **referencias nuevas** que rompen memoización o effects (useCallback).
- No son gratis: solo donde el profiling o el patrón lo justifican.

---

## Event Loop

```js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
```

### Resultado

```txt
1
4
3
2
```

### ¿Por qué?

- Stack síncrona: **1**, luego **4**.
- `setTimeout` → **macrotask** (cola de timers).
- `Promise.then` → **microtask** (se vacía antes del siguiente macrotask).
- Orden: microtasks (**3**) antes que macrotask (**2**).

---

## TypeScript

```ts
interface User {
  id: number;
  name: string;
}
```

### `type OptionalUser = ?`

```ts
type OptionalUser = Partial<User>;
// todas opcionales

// o solo algunas:
type OptionalUser = Partial<Pick<User, 'name'>> & Pick<User, 'id'>;
```

### `type UserKeys = keyof User`

```ts
type UserKeys = keyof User; // 'id' | 'name'
```

### `type ApiResponse<T> = ?`

```ts
type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

// variantes comunes en entrevista:
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## Array manipulation

```js
const users = [
  { id: 1, active: true },
  { id: 2, active: false },
  { id: 3, active: true }
];
```

### Obtener sólo los activos

```js
users.filter(u => u.active);
```

- `filter` no muta; devuelve nuevo array.

---

## React Native

### FlatList

**¿Por qué FlatList en lugar de ScrollView?**

- ScrollView monta **todos** los hijos → no escala en listas largas.
- FlatList **virtualiza**: solo items visibles + buffer → menos memoria y mejor scroll.

**¿Qué hace `keyExtractor`?**

- Devuelve **id estable** por fila para reconciliar celdas recicladas; evita estado mezclado y remounts erráticos. Ver `02-RN.md`.

**¿Qué problemas de performance conocés?**

- `renderItem` sin `memo`, inline styles/functions, `key={index}` con reorder, `extraData` mal usado, imágenes sin cache, animaciones en JS thread, listas dentro de ScrollView, demasiados re-renders del padre.

### Navigation

**Stack vs Tab**

- **Stack** — flujo lineal push/pop (detalle sobre lista, wizard, modal stack).
- **Tab** — secciones principales persistentes (Home, Search, Profile); cada tab suele tener su propio stack anidado.

**Pasar parámetros entre pantallas**

```tsx
navigation.navigate('Details', { id: 42 });
// en la screen destino:
const { id } = route.params;
// tipado: NativeStackScreenProps<RootStackParamList, 'Details'>
```

### Estado: Context vs Redux vs Zustand

| Herramienta | Cuándo |
|---|---|
| **Context** | Tema, locale, auth simple, pocos consumidores; evitar estado que cambia muy seguido (re-render masivo). |
| **Redux** | App grande, estado global complejo, middleware, DevTools, equipos que ya estandarizan RTK; muchas entidades relacionadas. |
| **Zustand** | Global liviano, menos boilerplate, selectors granulares, buen balance en apps medianas. |

- **Local `useState`** — UI de una pantalla o componente.
- Regla senior: no Redux “por default”; escalar cuando el dolor de prop drilling / sync justifica la complejidad.

---

## Arquitectura Senior (abiertas)

### La app tiene problemas de rendimiento. ¿Cómo investigarías?

1. **Reproducir** — dispositivo real, release build, flujo concreto (lista, navegación, cold start).
2. **Medir** — FPS, tiempo a interactive, tamaño de bundle, memoria.
3. **Profiler** — React DevTools Profiler (commits, componentes caros), Hermes/Flipper, Systrace/Instruments en nativo.
4. **Network** — waterfall, payloads, N+1, cache (TanStack Query `staleTime`).
5. **Renders** — ¿quién re-renderiza de más? props por referencia, context, state alto.
6. **Optimizar** — virtualizar listas, memo puntual, imágenes, Reanimated en UI thread, lazy screens, paginación; validar con segunda medición.

### Pantalla tarda 10 s en abrir. ¿Proceso de diagnóstico?

1. ¿**Cold start** o navegación a screen? Separar app launch vs mount de ruta.
2. **Timeline** — splash → JS bundle load → primer frame → fetch → render pesado.
3. **Network** — ¿API bloqueante antes de mostrar UI? → skeleton + fetch paralelo, cache, prefetch.
4. **JS thread** — parse/import pesado, sync en mount, JSON grande sin paginar.
5. **Nativo** — módulos que bloquean en init, imágenes enormes, layout costoso.
6. **Fix incremental** — quick win (cache, lazy import) → medir → siguiente cuello.

*Buscan razonamiento estructurado, no una respuesta mágica.*

---

## Doble setState (muy común)

```tsx
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
  setCount(count + 1);
}

increment();
```

### ¿Qué valor queda?

```txt
1
```

- Mismo render: ambos usan el **mismo** `count` (0) → 0+1 y 0+1 → React **batch** → un solo update a **1**.

```tsx
setCount(prev => prev + 1);
setCount(prev => prev + 1);
```

### Resultado

```txt
2
```

- Cada updater recibe el **estado pendiente** anterior → 0→1→2 en el mismo evento.

---

## Checklist mental antes del quiz

- [ ] Stale closure en `useEffect` con `[]`
- [ ] Mutar state sin nueva referencia
- [ ] Loop por función en deps
- [ ] Event loop: microtasks antes que macrotasks
- [ ] Batching y updaters funcionales
- [ ] FlatList + keys + virtualización
- [ ] Proceso reproduce → mide → optimiza

Ver también: `00-JS.md` · `01-React.md` · `02-RN.md` · `03-Performance.md` · `04-General.md` · `05-LiveCoding.md`.

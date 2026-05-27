# Redux y Estado

## 1. ¿Qué es un slice?

Un **slice** es un módulo del store que agrupa state, reducers y actions de **un dominio** (auth, cart, settings).

En Redux Toolkit se crea con `createSlice`:

```ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
  },
});
```

**Genera automáticamente:** action creators · action types · reducer del slice

**Estructura típica del store:**

```txt
store/
  slices/
    authSlice.ts
    cartSlice.ts
  api/          # RTK Query (opcional)
  index.ts      # configureStore
```

Organizar por **dominio de negocio**, no por tipo técnico (`actions/`, `reducers/` sueltos).

---

## 2. Principios de Redux

Flujo unidireccional:

```
UI → dispatch(action) → reducer → nuevo state → UI se re-renderiza
```

| # | Principio | En la práctica |
|---|---|---|
| 1 | **Single source of truth** | Todo el state global vive en **un solo store**. |
| 2 | **State is read-only** | No se muta directo — solo vía **dispatch(action)**. |
| 3 | **Cambios con funciones puras** | Los **reducers** reciben `(state, action)` y devuelven el nuevo state. |

---

## 3. ¿Cuándo usarlo y cuándo no?

| Usar Redux (RTK) | Evitar Redux |
|---|---|
| mucho state global compartido y frecuente | app chica con poco state compartido |
| equipo que necesita DevTools / trazabilidad | principalmente datos del servidor |
| lógica de negocio centralizada con thunks/listeners | state de UI efímero → `useState` |
| ya estandarizaste RTK Query + slices | Redux solo para cachear API a mano |

**Alternativas más livianas:** Context + `useState` · Zustand

**Red flag:** duplicar server data en slices cuando React Query ya lo cachea → boilerplate y bugs de stale data.

---

# Más en profundidad

## 1. ¿Qué problema resuelve Redux?

Centraliza **state global del cliente** con el flujo unidireccional visto arriba.

**Resuelve:**

- state compartido complejo entre muchas pantallas
- flujo predecible y auditable (action log)
- debugging con Redux DevTools y time-travel
- middleware para side effects (logging, analytics, persist)
- inmutabilidad como contrato del state

**No resuelve bien:**

- cache de API / server state (usar React Query o RTK Query)
- state efímero de UI (modal abierto, tab activo)
- forms locales

---

## 2. ¿Qué es un reducer?

Función **pura** que define cómo cambia el state ante una action:

```ts
(state, action) => newState
```

**Reglas:**

- determinístico: mismo input → mismo output
- **sin side effects** (no fetch, no `Date.now()`, no random)
- **no muta** el state anterior — devuelve uno nuevo
- side effects van en middleware, thunks o listeners

Con **Immer** (RTK), podés escribir lógica “mutante” que Immer traduce a updates inmutables — como en el `addItem` del slice de arriba.

---

## 3. ¿Qué significa que Redux sea immutable?

Cada transición produce un **nuevo objeto state** (copia superficial en el path que cambió). Nunca se modifica el state anterior in-place.

**Por qué importa:**

- React-Redux compara **referencias** para decidir re-renders
- mutar directamente rompe change detection → UI que no actualiza
- time-travel debugging depende de snapshots inmutables

**En la práctica (RTK + Immer):** escribís como si mutaras, pero el resultado es inmutable.

---

## 4. ¿Qué ventajas tiene Zustand?

Store global **minimalista** sin boilerplate de Redux.

| Ventaja | Detalle |
|---|---|
| **Poco setup** | Sin providers obligatorios, API de pocas líneas |
| **TypeScript first** | Tipado directo del store |
| **Suscripciones granulares** | Componentes se suscriben solo a lo que usan |
| **Fuera de React** | Store vanilla usable en servicios/utils |
| **Prototipado rápido** | Ideal para state global moderado |

```ts
const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
```

**No ideal cuando:** necesitás ecosystem de middleware maduro, time-travel crítico, o el equipo ya usa RTK Query + slices.

---

## 5. ¿Qué ventajas tiene React Query?

Librería para **server state** (datos del backend cacheados en el cliente). Default recommendation para fetch/cache en apps RN.

| Ventaja | Qué hace |
|---|---|
| **Cache key-based con TTL** | `staleTime` (cuándo se considera viejo) · `gcTime` (cuándo se elimina del cache) |
| **Background refetch** | Revalida al volver al foreground, reconectar red o remount |
| **Deduplicación** | Requests paralelos con misma query key → un solo fetch |
| **Hooks declarativos** | `isLoading`, `error`, `data` out of the box |
| **Mutations** | Optimistic updates + invalidation de queries relacionadas |
| **Pagination / infinite scroll** | `useInfiniteQuery` y primitives listas |
| **Devtools** | Inspección de cache, queries y mutations en runtime |

**En RN:** integrar con NetInfo (`onlineManager`) y persist (AsyncStorage/MMKV) para offline.

**Regla:** no uses Redux, Context ni Zustand como cache manual de API — reinventás invalidation, dedup y background refetch.

---

## 6. Panorama: qué herramienta para qué

| Tipo de state | Ejemplos | Herramienta típica |
|---|---|---|
| **UI local** | input, modal, tab | `useState` |
| **UI global** | theme, locale, auth flags | Context · Zustand · Redux |
| **Cliente global complejo** | cart, wizard multi-step | Redux (RTK) · Zustand |
| **Server state** | users, feeds, catálogo | React Query · RTK Query |

**Combo común en apps medianas/grandes:** React Query (server) + Zustand o Redux (cliente global) + `useState` (UI local).

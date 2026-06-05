# Conceptos clave React

Bullets para repaso de memoria — chequeo mental para entrevistas.

## Reconciliation

- Ocurre en la **render phase**: compara el **árbol virtual nuevo** con el anterior y calcula el **mínimo** de cambios a aplicar (aún **no** toca DOM ni host nativo).
- **Diffing heurístico** (O(n)): asume que elementos del mismo tipo en la misma posición son “el mismo nodo”.
- **Keys** — identidad estable entre renders; sin key correcta, React reutiliza nodos mal y pierde estado interno o animaciones.
- Cambio de **tipo** de elemento (`div` → `span`, `ComponentA` → `ComponentB`) → desmonta subtree viejo y monta uno nuevo.
- Props que cambian → actualiza el nodo existente; hijos se reconcilian recursivamente.
- **Batching** — múltiples `setState` en el mismo evento se agrupan en un solo render (React 18+ también en Promises, timeouts con `createRoot`).

## Ciclo de render

1. **Trigger** — `setState`, `useState` setter, `useReducer` dispatch, contexto que cambió, props del padre, `forceUpdate` (raro).
2. **Render phase** (puro, interrumpible en Concurrent) — ejecuta la función del componente / hooks; produce el nuevo árbol virtual y hace **reconciliation** (diff). **No** toca DOM ni efectos secundarios aquí.
3. **Commit phase** — aplica al host (DOM/nativo) los cambios ya calculados en render; ejecuta `useLayoutEffect`, pinta.
4. **Passive effects** — `useEffect` corre **después** del paint (async respecto al commit).
5. Hijo con **mismas props** (shallow) y mismo tipo puede **bail out** si está envuelto en `React.memo` y el padre re-renderizó sin cambiarle props.
6. **Strict Mode (dev)** — monta, desmonta y remonta para detectar efectos no idempotentes.

```text
evento → render (JS) → commit (DOM) → paint → useEffect
```

## Memoization

- Guardar resultado de un cálculo o referencia de función para **no recrearla** en cada render si las entradas no cambiaron.
- Útil cuando: cálculo caro, referencia estable para deps de `useEffect`/`useCallback`, evitar que hijos memoizados re-rendericen.
- **No** es gratis: comparar deps y mantener caché tiene costo; memoizar todo puede empeorar performance y legibilidad.
- Regla: medir primero; memoizar puntos calientes (listas grandes, hijos pesados, callbacks a `React.memo` children).

## useEffect pitfalls

- **No es “lifecycle mount”** — corre después del paint; puede correr varias veces (Strict Mode, deps que cambian).
- **Deps vacías `[]`** — solo “al montar” en prod, pero captura valores del **primer** render → stale closure si leés state/props sin deps.
- **Deps incompletas** — bug clásico: effect usa `userId` pero no está en el array → lógica desactualizada.
- **Deps que cambian cada render** — objetos/arrays/funciones inline nuevos → effect en loop infinito.
- **Race conditions** — fetch sin cleanup: respuesta vieja pisa estado nuevo → `AbortController` o flag `cancelled`.
- **Sincronizar dos sistemas** — effect para “copiar props a state” suele ser anti-patrón; derivar en render o key en el hijo.
- **useLayoutEffect** — solo si necesitás medir DOM o evitar flicker **antes** del paint; bloquea pintura.
- Cleanup — timers, subscriptions, listeners; return function en el effect.

## useMemo vs useCallback vs React.memo

| Hook / API | Qué memoriza | Cuándo |
|---|---|---|
| **useMemo** | **Valor** (resultado de expresión) | Cálculo costoso, objeto/array estable para deps o props de hijo memo |
| **useCallback** | **Función** (referencia estable) | Pasar callback a hijo `React.memo` o a deps de effect sin re-disparar |
| **React.memo** | **Componente entero** (skip render si props shallow-equal) | Hijo puro que re-renderiza mucho con mismas props |

- `useCallback(fn, deps)` ≈ `useMemo(() => fn, deps)`.
- `React.memo` no evita que el **padre** renderice; evita que el **hijo** vuelva a ejecutar su función si props iguales.
- Los tres comparan deps con **igualdad referencial** (`Object.is`), no deep equal.

## Context API

- **Problema que resuelve** — **prop drilling**: pasar props por capas intermedias que no las usan solo para que lleguen al hijo profundo.
- **API mínima** — `createContext(defaultValue)` → `<MyContext.Provider value={…}>` → `useContext(MyContext)` en cualquier descendiente.
- **Provider** — cualquier componente bajo el Provider puede leer el valor; no hace falta pasarlo manualmente por props.
- **defaultValue** — solo se usa si **no** hay Provider arriba en el árbol; no re-renderiza consumidores por sí solo.
- **Cambio de `value`** — si el Provider entrega un `value` nuevo (referencia distinta), **todos** los componentes que llaman `useContext` en ese contexto re-renderizan.
- **Memoizar el `value`** — `value={{ user, login }}` inline en cada render crea objeto nuevo → rerender masivo; usar `useMemo(() => ({ user, login }), [user, login])`.
- **Split de contextos** — separar por dominio (`ThemeContext`, `AuthContext`) en lugar de un solo contexto con todo el state de la app.
- **Provider component** — patrón típico: componente que encapsula `useState`/`useReducer`, effects y expone `{ state, actions }` memoizado.
- **Custom hook** — `function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('…'); return ctx; }` para API clara y error si falta Provider.
- **No es un store global completo** — React Context no trae selectores, middleware ni devtools; para state global complejo → Zustand, Redux, Jotai, etc.
- **Selectores** — React core no filtra por campo: leer el contexto entero suscribe al objeto completo; librerías (`use-context-selector`) o state externo si necesitás granularidad.

Ejemplo clásico — guardar el **nombre de usuario** y leerlo en un hijo profundo sin prop drilling:

```jsx
import { createContext, useContext, useMemo, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [username, setUsername] = useState('');

  const value = useMemo(
    () => ({ username, setUsername }),
    [username],
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

// Hijo profundo — no recibe username por props
function WelcomeBanner() {
  const { username } = useUser();
  return <p>Hola, {username || 'invitado'}</p>;
}

function App() {
  return (
    <UserProvider>
      <WelcomeBanner />
    </UserProvider>
  );
}
```

- `UserProvider` tiene el state; `useMemo` evita un `value` nuevo en cada render si `username` no cambió.
- `WelcomeBanner` puede estar a 5 niveles de profundidad y igual accede con `useUser()`.

## ¿Qué causa rerenders innecesarios?

- **State en ancestro alto** — cualquier cambio re-renderiza todo el subtree; bajar estado o dividir contextos.
- **Context sin selectores** — un valor de contexto nuevo (objeto inline) re-renderiza **todos** los consumidores.
- **Props nuevas por referencia** — `style={{}}`, `onPress={() => …}`, `data={[...]}` en cada render → rompe `React.memo`.
- **Keys inestables** — `key={Math.random()}` fuerza remount y pierde optimizaciones de lista.
- **Context + estado mezclados** sin memoizar el `value` del Provider.
- **Redux/Zustand** — selector que devuelve objeto nuevo cada vez → suscripción dispara siempre.
- **Padre re-renderiza** → hijos no memoizados **siempre** re-renderizan aunque sus props “sean iguales” en valor (nueva referencia).
- **Solución típica** — estado local, `React.memo`, `useCallback`/`useMemo` con deps correctas, context split, bibliotecas de lista virtualizadas, profiling.

# Hooks de React

## 1. ¿Qué problema vino a resolver useEffect?

Antes de los hooks, la lógica con efectos secundarios (fetch, suscripciones, timers, manipulación del DOM) se repartía entre `componentDidMount`, `componentDidUpdate` y `componentWillUnmount`. Eso fragmentaba el código por *ciclo de vida* en lugar de por *responsabilidad*.

`useEffect` unifica eso en un solo lugar: declarás qué efecto querés y cuándo debe re-ejecutarse (dependency array). Además permite usar efectos en componentes funcionales sin HOCs ni render props, y composar lógica en custom hooks reutilizables.

En una entrevista senior: mencioná que no reemplaza toda la lógica de clases — reemplaza el *modelo mental* de “montaje/actualización/desmontaje” por “sincronizar con algo externo al render”.

---

## 2. Diferencia entre useEffect y useLayoutEffect

Ambos tienen la misma API, pero el timing es distinto:

- **useEffect** — corre *después* de que el browser pinta. No bloquea el paint. Ideal para fetch, suscripciones, analytics, la mayoría de efectos.
- **useLayoutEffect** — corre *después* del DOM update pero *antes* del paint. Bloquea la pintura hasta que termina.

Usá `useLayoutEffect` cuando necesitás medir o mutar el DOM y evitar un flash visual (ej: posicionar un tooltip, sincronizar scroll, animaciones que dependen de medidas). En SSR puede generar warnings porque no hay layout en el servidor — en esos casos preferí `useEffect` o un guard.

---

## 3. ¿Cuándo usar useMemo?

`useMemo` memoriza el *resultado* de un cálculo costoso entre renders, recalculando solo cuando cambian las dependencias.

Usalo cuando:

- El cálculo es genuinamente caro (filtrar/ordenar miles de items, transformaciones pesadas).
- Necesitás referential equality estable para pasar props a un hijo memoizado (`React.memo`) o como dependencia de otro hook.

No lo uses por default en cada variable derivada — el propio memo tiene costo (comparar deps + guardar valor).

---

## 4. ¿Cuándo usar useCallback?

`useCallback` memoriza la *función* en sí (referencia estable), no su resultado.

Usalo cuando:

- Pasás callbacks a hijos envueltos en `React.memo` y el hijo se re-renderiza innecesariamente por referencia nueva.
- La función es dependencia de `useEffect`, `useMemo` u otro hook que reacciona a identidad.
- Registrás/desregistrás listeners donde la misma referencia importa.

---

## 5. ¿Cuándo NO usar useMemo/useCallback?

Evitalos cuando:

- El cálculo es trivial (concatenar strings, sumar dos números).
- El componente hijo no está memoizado — la referencia estable no evita ningún render.
- Optimizás prematuramente sin evidencia de problema (Profiler, métricas).
- Complican la lectura del código más de lo que ahorran.

Regla práctica de senior: medí primero, optimizá después. El costo de memoización + deps incorrectas puede ser peor que re-renderizar un componente barato.

---

## 6. ¿Qué problemas genera un dependency array incorrecto?

Un dependency array mal armado causa dos clases de bugs:

- **Deps faltantes** → stale closures: el efecto o callback usa valores viejos del render anterior (ej: contador que siempre suma 1 en lugar del valor actual).
- **Deps de más o inestables** → re-ejecuciones innecesarias, loops infinitos (objetos/funciones recreadas cada render), o fetch duplicados.

El linter `react-hooks/exhaustive-deps` ayuda pero no reemplaza el criterio. Para funciones/objetos como deps, estabilizá con `useCallback`/`useMemo` o mové la lógica dentro del efecto.

---

## 7. ¿Qué es un stale closure?

Una *stale closure* ocurre cuando una función “captura” variables de un render anterior y sigue usándolas aunque el state/props ya cambió.

Ejemplo clásico: un `setInterval` dentro de `useEffect([])` que lee `count` — siempre ve el valor inicial porque la closure no se recreó.

Soluciones:

- Incluir la variable en el dependency array.
- Usar la forma funcional de setState: `setCount(c => c + 1)`.
- Guardar el valor actual en un `useRef` si necesitás la última versión sin re-suscribirte.

---

## 8. ¿Cómo evitar renders innecesarios?

Estrategias, de más impacto a más granular:

- **Arquitectura de state** — state lo más local posible; evitar contextos que cambian frecuentemente para todo el árbol.
- **React.memo** — en componentes puros con props estables.
- **useMemo / useCallback** — para props derivadas y callbacks hacia hijos memoizados.
- **Split de context** — separar state y dispatch, o múltiples contextos por dominio.
- **Virtualización** — en listas largas (FlatList en RN).

Siempre validá con React DevTools Profiler o Flipper antes de optimizar.

---

## 9. ¿Qué pasa cuando cambia el state?

Cuando llamás a un setter de state (`setState`, `useState`, `useReducer`):

1. React encola la actualización (con batching en event handlers y, desde React 18, también en promises/timeouts).
2. En el próximo render, React ejecuta tu función de componente con el nuevo state.
3. Compara el nuevo Virtual DOM con el anterior (reconciliation).
4. Calcula el diff mínimo y aplica cambios al DOM nativo (o a la vista en RN).
5. Corren effects cuyas dependencias cambiaron (después del paint, salvo layout effects).

El state update es *asíncrono* — no podés leer el nuevo valor inmediatamente después del setter en el mismo tick.

---

## 10. ¿Cómo funciona el ciclo de render?

Render phase (puro, puede interrumpirse en Concurrent Mode):

- React invoca el componente → obtiene elementos React (Virtual DOM).
- Reconciliation: compara con el árbol anterior, decide qué conservar/mover/crear/eliminar según type, key y props.

Commit phase (no interrumpible):

- Aplica cambios al host (DOM / native views).
- Ejecuta `useLayoutEffect` / `componentDidMount|Update`.
- Browser pinta.
- Ejecuta `useEffect`.

En React 18+, updates pueden ser concurrentes: React puede preparar múltiples versiones y priorizar interacciones del usuario.

---

## 11. ¿Qué diferencia hay entre state y refs?

| State | Ref |
|---|---|
| Cambiar state dispara re-render | Cambiar `.current` NO re-renderiza |
| Inmutable desde la perspectiva del render (nuevo valor → nuevo render) | Mutable entre renders |
| Para UI que debe reflejarse en pantalla | Para valores imperativos: DOM nodes, timers IDs, valores previos, flags |

Los refs persisten entre renders igual que el state, pero son una “caja mutable” fuera del flujo declarativo.

---

## 12. ¿Cuándo usar useRef?

- Referencia a un elemento DOM o componente nativo (`TextInput.focus()` en RN).
- Guardar IDs de timers/intervals/subscriptions para cleanup.
- Almacenar el valor anterior de una prop/state (patrón `usePrevious`).
- Flags imperativos que no deben causar render (ej: “ya se disparó analytics”).
- Evitar stale closures manteniendo la última versión de un callback.

No uses ref como atajo para evitar re-renders de UI que *sí* debería actualizarse — eso es un bug.

---

## 13. ¿Qué hace realmente React.memo?

`React.memo` es un HOC que memoriza el *resultado del render* de un componente funcional. En el siguiente render del padre, compara props nuevas vs anteriores (shallow compare por default, o custom con `arePropsEqual`).

Si las props son iguales → React reutiliza el último resultado y **salta** el render del hijo.

Importante: solo ayuda si el padre re-renderiza frecuentemente y el hijo es costoso o tiene muchos descendientes. No memoices todo — la comparación también cuesta. En RN, combiná con props estables (`useCallback`) y evitá pasar objetos inline.

---

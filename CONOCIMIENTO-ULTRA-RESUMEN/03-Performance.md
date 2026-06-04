# Performance React / React Native

Bullets para repaso de memoria.

## ¿Por qué una pantalla rerenderiza?

- Cambió **state** o **props** de la pantalla o de un ancestro.
- **Context** consumido cambió (nuevo `value` en Provider).
- **Store global** (Redux, Zustand, TanStack Query) notificó suscriptores.
- **Navigation** — params/focus listeners que actualizan state al entrar/salir.
- **Padre** re-renderizó y la pantalla no está en `React.memo` / no bailó.
- **Lista** — item en FlatList con `extraData` o state global que invalida toda la lista.
- Diagnóstico: React DevTools “Highlight updates”, Flipper, o `why-did-you-render` (dev).

## Profiling

- **React DevTools Profiler** — grabar interacción, ver commits, tiempo por componente, “ranked” chart.
- **Hermes Sampling Profiler** — CPU en JS thread (Metro, Android Studio).
- **Flipper** — React DevTools, layout, network, performance plugins.
- **Android Studio / Instruments (iOS)** — nativo: Systrace, GPU, memoria.
- **Flashlight / perf monitors** — FPS, JS thread vs UI thread en RN.
- Flujo: reproducir lag → Profiler → componente más caro → ¿render duplicado o trabajo en render? → optimizar o mover fuera del render.

## Memory leaks

- **Listeners** no removidos (`addEventListener`, `AppState`, NetInfo, Keyboard).
- **Timers** (`setInterval`, `setTimeout`) sin clear en cleanup de `useEffect`.
- **Subscriptions** (WebSocket, observables, event emitters) sin unsubscribe.
- **Navigation listeners** — `navigation.addListener` sin return remove en blur/unmount.
- **Closures** que retienen objetos grandes (cache en ref sin límite).
- **Imágenes / listas** — caches sin bound; cargar miles de items fuera de virtualización.
- **Nativo** — módulos que guardan callback a JS después de unmount.
- Prevención: cleanup en effects, `useFocusEffect` con cleanup, weak refs donde aplique, virtualizar listas.

## Lazy loading

- **React.lazy + Suspense** — code-split por ruta/pantalla (más común en web; en RN con bundler que soporte dynamic import).
- **Navigation lazy screens** — `React Navigation` puede diferir montaje de tabs/stacks no visitados.
- **Imágenes** — cargar resolución correcta, placeholder, `expo-image` / FastImage con cache.
- **Datos** — paginación infinita, no traer dataset completo al mount.
- **Heavy modules** — `require` dinámico o import diferido de librerías pesadas (maps, charts) al abrir la feature.

## Optimizar renders

- **Estado local** — solo donde se necesita; evitar un solo `useState` gigante en root.
- **React.memo** en hijos costosos con props estables.
- **useMemo / useCallback** con deps correctas (no sobreusar).
- **Context** — dividir por dominio o usar selectors (Zustand, `use-context-selector`).
- **Listas** — FlatList/FlashList: `keyExtractor`, `getItemLayout`, `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`, `memo` en `renderItem`.
- **Evitar** inline objects/functions en props de hijos memoizados.
- **Reanimated** — animaciones en UI thread, no `setState` por frame.
- **InteractionManager** — diferir trabajo no crítico post-animación/navegación.
- Medir antes y después; una optimización sin profiling es adivinanza.

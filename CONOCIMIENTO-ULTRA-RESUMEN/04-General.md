# Patrones generales (mobile / frontend)

Bullets para repaso de memoria.

## Cómo implementás paginación

- **Offset/limit** — `?page=2&limit=20` o `?offset=40&limit=20`. Simple; problemas si el dataset cambia entre páginas (duplicados/saltos).
- **Cursor** — `?cursor=eyJpZCI6MTIzfQ&limit=20`. Estable con feeds que mutan; API devuelve `nextCursor`.
- **Cliente** — estado: `items`, `page`/`cursor`, `isLoading`, `hasMore`, `error`.
- **FlatList** — `onEndReached` + throttle; append al array; `ListFooterComponent` con spinner; no disparar si `!hasMore || isLoading`.
- **TanStack Query** — `useInfiniteQuery` con `getNextPageParam`; cache por query key; `fetchNextPage()`.
- **Idempotencia** — deduplicar por `id` al mergear páginas; reset al cambiar filtros.
- **Pull-to-refresh** — reset a página 1 / cursor null.

```text
mount → fetch page 1 → scroll end → fetch next → concat → hasta !hasMore
```

## Lista con búsqueda

- **Debounce** en el input (300–500 ms) antes de llamar API o filtrar dataset grande.
- **Dos modos:** (1) filtro **local** si ya tenés todos los items en memoria (`filter` + `includes`); (2) **server-side** `?q=term` si el dataset es grande.
- Estado: `query`, `debouncedQuery`, `results`, `isSearching`, `error`.
- Cancelar request anterior (`AbortController`) cuando cambia `debouncedQuery`.
- **FlatList** con `data={results}`; `keyExtractor` estable; empty state y skeleton en primera carga.
- Limpiar búsqueda → restaurar lista default o refetch sin `q`.
- Accesibilidad: label en input, loading anunciado.

## Consumir una API

- **Capa HTTP** — `fetch` o axios con `baseURL`, timeouts, interceptors (auth header, refresh token, logging).
- **Tipos** — contratos TypeScript (OpenAPI, zod) para request/response.
- **Errores** — mapear status: 401 → logout/refresh, 404 → not found UI, 5xx → retry con backoff.
- **Auth** — Bearer en interceptor; token en SecureStore/MMKV, no AsyncStorage para secrets.
- **Cache y estado** — TanStack Query: `queryKey`, `staleTime`, `gcTime`, invalidación tras mutación.
- **Mutaciones** — POST/PATCH/DELETE + `invalidateQueries` o optimistic update con rollback.
- **Offline** — leer cache, cola de mutaciones, sync al reconectar (ver 02-RN Offline First).
- **No** mezclar fetch crudo en cada componente; un módulo `api/` o hooks por dominio.

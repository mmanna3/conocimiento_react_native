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

## Códigos HTTP más usados

- **2xx — éxito**
  - **200 OK** — GET/PUT exitoso; body con datos.
  - **201 Created** — POST creó recurso; suele devolver `Location` o el objeto creado.
  - **204 No Content** — éxito sin body (DELETE, PATCH, PUT sin respuesta).
- **3xx — redirección / cache**
  - **301 Moved Permanently** — URL cambió para siempre; actualizar bookmarks/cliente.
  - **304 Not Modified** — cache válida; el cliente usa la versión local (`If-None-Match` / `If-Modified-Since`).
- **4xx — error del cliente**
  - **400 Bad Request** — payload malformado o parámetros inválidos.
  - **401 Unauthorized** — sin auth o token inválido/expirado → login o refresh.
  - **403 Forbidden** — autenticado pero sin permiso para ese recurso.
  - **404 Not Found** — recurso o ruta inexistente.
  - **409 Conflict** — conflicto de estado (ej. email duplicado, versión desactualizada).
  - **422 Unprocessable Entity** — sintaxis OK pero validación de negocio falló (campos, reglas).
  - **429 Too Many Requests** — rate limit; respetar `Retry-After`.
- **5xx — error del servidor**
  - **500 Internal Server Error** — fallo genérico del backend.
  - **502 Bad Gateway** — proxy/gateway recibió respuesta inválida del upstream.
  - **503 Service Unavailable** — servidor caído o en mantenimiento; reintentar con backoff.

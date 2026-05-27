# Otros

## 1. ¿REST vs GraphQL?

**REST:** simple, cache HTTP estándar, tooling maduro. Over/under-fetching posible. Bueno para APIs CRUD estándar.

**GraphQL:** cliente pide exactamente lo que necesita; un endpoint; tipado fuerte con schema. Complejidad en server (resolvers, N+1 con DataLoader), caching más difícil que REST HTTP cache.

En mobile: GraphQL brilla con pantallas agregadas (home feed) y versionado de campos; REST brilla con simplicidad y TanStack Query. Elegí según equipo backend y shape de datos.

---

## 2. Autenticación con JWT

JWT = string firmado en 3 partes (`header.payload.signature`). El payload trae claims (sub, exp, roles); el server valida la firma — el cliente no puede alterarlo sin invalidar el token.

### Flujo básico

1. **Login** — usuario envía credenciales (o OAuth) → server valida → responde `accessToken` (+ opcionalmente `refreshToken`).
2. **Guardar** — access token en memoria mientras la app está activa; refresh token en secure storage (Keychain / Keystore). Nunca AsyncStorage ni query params.
3. **Requests autenticados** — interceptor agrega `Authorization: Bearer <accessToken>` a cada request.
4. **Validación server** — verifica firma, expiración (`exp`), issuer/audience si aplica. Responde 401 si inválido o expirado.
5. **Logout** — borrar tokens de storage, limpiar memoria, invalidar cache (React Query), reset navigation a login.

### En React Native

- Interceptor en axios/fetch wrapper — lógica delgada, auth en `authService`.
- Access token corto (15–60 min) limita ventana si se filtra.
- No loguear tokens ni enviarlos en analytics/Sentry.
- Biometric gate opcional para reabrir sesión desde Keychain (fintech, salud).

JWT es **stateless** en el server (no consulta DB por request), pero implica que revocación inmediata es más difícil — por eso access tokens cortos + refresh token rotativo.

---

## 3. ¿Cómo manejás refresh token expiration?

Patrón **refresh token rotation**:

1. Request recibe **401** → interceptor pausa cola de requests pendientes.
2. Intenta refresh con refresh token — **single flight** (solo un refresh concurrente, los demás esperan).
3. **Éxito** → guardar nuevos tokens (server puede rotar refresh token), replay requests en cola.
4. **Fallo** (refresh expirado, revocado, 401/403) → logout forzado, redirect a login.

Cuidados:

- Race conditions con múltiples 401 simultáneos — mutex/queue.
- Refresh token solo en secure storage; rotación server-side invalida el anterior.
- No retry infinito en refresh — un fallo = sesión terminada.

Alternativa sin refresh: re-login cuando expira el access token (más simple, peor UX en apps de uso prolongado).

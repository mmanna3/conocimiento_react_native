# Offline First

## 1. ¿Cómo sincronizar datos offline?

Patrón outbox / mutation queue:

1. Usuario actúa offline → guardar mutación local + optimistic UI.
2. Cola persistente (SQLite) con estado: pending, syncing, failed.
3. Al reconectar, procesar cola FIFO con retry.
4. Server confirma → marcar synced, actualizar cache.
5. Pull sync periódico para cambios remotos (delta sync, timestamps, version vectors).

WatermelonDB sync adapter, PowerSync, o custom con TanStack Query persist + mutation queue.

---

## 2. ¿Cómo resolver conflictos de sincronización?

Estrategias (elegir por dominio):

- **Last-write-wins** — simple, puede perder datos.
- **Server wins / client wins** — según criticidad.
- **Merge field-level** — CRDTs para texto colaborativo.
- **Manual resolution** — UI “conflict detected” para casos críticos.
- **Version vectors / optimistic locking** — 409 Conflict del server.

Documentar por entidad: un carrito puede ser LWW; un formulario médico necesita merge manual.

---

## 3. ¿Cómo diseñarías offline-first?

- Local DB como source of truth inmediato — UI lee siempre de local.
- Sync engine background bidireccional.
- IDs temporales (UUID client-side) hasta confirmación server.
- Estados de sync visibles (icon cloud sync, retry).
- Conflict policy definida por feature.
- Tests: airplane mode, flaky network, kill app mid-sync.

Referencias: Offline First manifesto, WatermelonDB, Relay/store-and-network (web analog).

---

## 4. ¿Qué opciones de storage existen en RN?

| Opción | Uso |
|---|---|
| AsyncStorage | Key-value simple, strings, prefs no sensibles |
| MMKV | Key-value rápido, sync, binary-safe |
| SQLite (expo-sqlite, op-sqlite) | Relacional, queries, datasets medianos |
| Realm / WatermelonDB | ORM offline-first, sync, listas reactivas |
| SecureStore / Keychain | Tokens, secrets pequeños |
| FileSystem | Archivos, media, downloads |

---

## 5. ¿Cuándo usar AsyncStorage?

- Preferencias de usuario (theme, locale, onboarding completed).
- Flags simples, cache pequeño serializado JSON.
- redux-persist / persist de React Query (con migraciones).

Es async, string-only, sin encriptación nativa — no para datos sensibles ni datasets grandes.

---

## 6. ¿Qué limitaciones tiene?

- Solo strings — serialización manual JSON.
- Async — no ideal para reads frecuentes en hot path (usar MMKV).
- Sin query/index — todo key-value flat.
- Límite de tamaño (~6MB iOS warn, variable Android) — no escala.
- No encriptado — accesible en device comprometido.
- Operaciones batch lentas comparado con MMKV/SQLite.

---

## 7. ¿Qué usarías para storage seguro?

- **iOS Keychain** / **Android Keystore** via `react-native-keychain` o Expo SecureStore.
- Biometric protection (`ACCESS_CONTROL.BIOMETRY`) para tokens.
- Encriptar valores grandes con clave en Keystore (react-native-encrypted-storage).

Nunca AsyncStorage para refresh tokens, PII, credenciales. Asumir que el filesystem del app es inspeccionable en devices rooteados/jailbroken.

---

## 8. ¿Qué usarías para datos grandes?

- **SQLite** — catálogos, historial, offline forms estructurados.
- **WatermelonDB** — listas reactivas con lazy loading, sync-friendly.
- **Realm** — object DB con sync Atlas (MongoDB).
- **FileSystem** — blobs, imágenes descargadas, PDFs.

AsyncStorage no escala. Migrar a SQLite cuando necesitás queries, índices, o > few MB.

---

## 9. ¿Qué problemas reales viste con persistencia?

- Schema migrations sin plan → corrupt storage, crash on launch.
- AsyncStorage lleno en Android gama baja.
- redux-persist rehydrate lento bloqueando startup.
- Datos stale mostrados como fresh sin indicador.
- Tokens en AsyncStorage filtrados en audit de seguridad.
- JSON.stringify de objetos circulares crash en persist.

Mitigación: versioned migrations, MMKV, secure storage, stale indicators, purge on logout.

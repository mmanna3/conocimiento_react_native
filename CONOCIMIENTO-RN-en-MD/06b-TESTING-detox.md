# Detox / E2E

## 1. ¿Qué ventajas tiene Detox?

- Gray-box testing — sincronización automática con idle de RN (no sleeps manuales).
- API declarativa: `element(by.id('login')).tap()`.
- Corre en simulador/emulador real — alta confianza.
- Integración CI (EAS, Bitrise, GitHub Actions).
- Matchers expresivos (`toBeVisible`, `toHaveText`).

Ideal para smoke tests y critical user journeys en RN.

---

## 2. ¿Qué diferencia hay entre Detox y Appium?

| Detox | Appium |
|---|---|
| Optimizado para RN | Multi-plataforma/multi-framework |
| Sync automático con RN bridge | Esperas manuales frecuentes |
| JS/TS tests | Multi-lenguaje (Python, Java...) |
| Menos flexible fuera RN | WebView, native puro, cross-app |

Appium si necesitás testing cross-stack o devices cloud heterogéneos; Detox si el stack es RN y querés sync confiable.

---

## 3. ¿Qué problemas comunes tiene Detox?

- Setup frágil con versiones RN/Xcode/Gradle.
- Flaky en CI si emulador lento o sin recursos.
- `testID` faltantes — tests acoplados a text que cambia con i18n.
- Animations/gestures complejos difíciles de automatizar.
- Debug builds más lentos; release builds para CI más estables pero menos debuggable.
- Expo requiere dev client — no funciona en Expo Go puro.

---

## 4. ¿Cómo evitar flaky tests?

- `testID` estables, no depender de copy traducido.
- Mock backend en E2E (staging dedicado, MSW server, fixtures).
- Reset app state entre tests (`device.launchApp({ delete: true })`).
- Evitar dependencia de timing — usar waitFor de Detox.
- Desactivar animaciones en test builds si causan race.
- Retry solo en CI infra issues, no en tests mal escritos.
- Quarantine flaky tests — fix or delete, nunca ignorar silenciosamente.

---

## 5. ¿Qué flows automatizarías sí o sí?

- Login / logout / session restore.
- Registro o onboarding crítico.
- Flujo de pago o acción de revenue.
- Deep link → screen destino correcta.
- Permisos críticos (camera, location) — al menos smoke.
- Push notification tap → navegación.

Priorizar por impacto de negocio × frecuencia de cambio × costo de bug en prod.

---

## 6. ¿Cómo integrar Detox en CI?

1. Build test binary (Detox config `ios.sim.debug` / android).
2. Boot emulator/simulator en CI (macOS runner para iOS).
3. `detox test` con headless flags.
4. Artifacts: screenshots on failure, logs, videos.
5. Parallel shards si suite grande.
6. EAS Workflows o dedicated device farm (BrowserStack) para escala.

Cache pods/gradle; prebuilt binaries para acelerar.

---

## 7. ¿Cómo debuggear tests inestables?

- Correr test aislado 10-20 veces (`--repeat`).
- `device.takeScreenshot` en cada step sospechoso.
- Logs de app + Detox trace.
- Verificar si falla solo en CI → recursos, race, network.
- Revisar si otro test deja state sucio.
- Grabar video del emulator en CI failure.

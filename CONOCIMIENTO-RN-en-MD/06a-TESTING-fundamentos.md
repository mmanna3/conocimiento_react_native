# Unit Testing

## 1. ¿Qué testearías y qué no?

**Testear:**

- Lógica de negocio pura (validators, formatters, pricing rules).
- Custom hooks con lógica no trivial.
- Componentes con comportamiento crítico (form submit, error states).
- Reducers, selectors, utils.

**No testear (o baja prioridad):**

- Implementación interna (state variable names, order of hooks).
- Estilos pixel-perfect.
- Librerías third-party (confiar en sus tests).
- Wrappers triviales sin lógica.

---

## 2. ¿Qué diferencia hay entre unit/integration/e2e?

| Tipo | Alcance | Velocidad | Confianza |
|---|---|---|---|
| Unit | Función/componente aislado, mocks | Muy rápido | Baja-media |
| Integration | Múltiples módulos reales (hook + API mock) | Medio | Media-alta |
| E2E | App completa, device/simulator | Lento | Alta |

Pirámide: muchos unit, menos integration, pocos E2E en critical paths (login, checkout, payment).

---

## 3. ¿Qué hace react-testing-library?

RTL renderiza componentes en un DOM/jsdom (o RN Testing Library en entorno de test RN) y provee queries orientadas al usuario: `getByRole`, `getByText`, `getByLabelText`.

Filosofía: testear como el usuario interactúa — no detalles de implementación. Dispara eventos (`fireEvent`, `userEvent`) y assertea outcomes visibles.

En RN: `@testing-library/react-native` con matchers de Jest Native (`toBeVisible`, etc.).

---

## 4. ¿Por qué evitar testear implementación?

Tests de implementación acoplados a internals (nombre de state, cantidad de hooks, clases CSS) se rompen en refactors que no cambian comportamiento — falsos negativos, mantenimiento caro.

Testear comportamiento observable: “al tap Submit con email inválido, muestra error” vs “state.errors.email tiene length 1”.

Excepción: unit tests de funciones puras donde la implementación ES el contrato.

---

## 5. ¿Qué hace act()?

`act()` envuelve updates que causan re-renders y effects para asegurar que React procese todos los updates antes de assertions.

Sin `act`: warnings “An update was not wrapped in act(...)” y assertions flaky (estado intermedio).

RTL y `renderHook` envuelven en act automáticamente en muchos casos. Manual en async: `await act(async () => { ... })`.

---

## 6. ¿Cómo mockear APIs?

- **MSW (Mock Service Worker)** — intercepta a nivel network, mismo código de API client.
- **jest.mock** del módulo api — rápido pero acoplado.
- **React Query** — `QueryClient` con `defaultOptions` retry false; prefetch data en test.
- Fixtures JSON reutilizables; factories (faker) para variaciones.

Preferir MSW para integration tests — testea el wiring real del client.

---

## 7. ¿Cómo mockear navigation?

```ts
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));
```

O wrap en `NavigationContainer` con test navigator. Assertear `mockNavigate('Screen', { id: 1 })` después de interacción.

Para Expo Router: mock del router module. Mantener mocks en setup file compartido.

---

## 8. ¿Cómo testear hooks?

`renderHook` de `@testing-library/react-native`:

```ts
const { result } = renderHook(() => useCounter());
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

Para hooks con context: wrapper con providers. Para async: `waitFor`. Extraer lógica pura del hook cuando sea testeable sin React.

---

## 9. ¿Cómo testear async flows?

- `waitFor` / `findBy*` queries (esperan aparición).
- `waitForElementToBeRemoved` para loaders.
- Fake timers (`jest.useFakeTimers`) para debounce.
- MSW con delay simulado.
- Evitar `setTimeout` arbitrarios — usar APIs async de RTL.

---

## 10. ¿Qué métricas de testing te importan?

- **Critical path coverage** — login, payments, core flows cubiertos.
- **Flaky rate** — % tests inestables en CI (objetivo ~0).
- **CI duration** — feedback loop < 10-15 min ideal.
- **Defect escape rate** — bugs en prod en áreas sin tests.
- **Mutation testing** (opcional avanzado) — calidad de assertions.

---

## 11. ¿Qué opinás de coverage?

Coverage es métrica de vanidad si no medís calidad de tests. 80% coverage con tests triviales no protege nada.

Útil como floor (ej: no mergear si coverage baja) y para detectar código nunca ejecutado. No perseguir 100% — costo/beneficio decae.

Mejor: coverage en domain logic + E2E en happy paths + manual exploratory para UX.

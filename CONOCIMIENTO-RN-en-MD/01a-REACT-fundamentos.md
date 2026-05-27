# React

## 1. ¿Qué es el Virtual DOM?

El Virtual DOM es una representación en memoria del UI como un árbol de objetos JavaScript (React elements). React no manipula el DOM nativo directamente en cada cambio de state — primero construye/actualiza el VDOM, lo compara con la versión anterior y aplica solo el diff mínimo al DOM real.

**Beneficios:** abstracción declarativa · batching de updates · punto central para optimizaciones (reconciliation, Concurrent features)

No es “más rápido que el DOM siempre” — en updates simples el overhead puede existir; gana en apps complejas con muchos updates parciales.

**En React Native:** concepto análogo — árbol de shadow nodes que se sincroniza con vistas nativas (UIKit/Android Views), no con DOM HTML.

---

## 2. ¿Qué hace el reconciliation algorithm?

Reconciliation es el proceso de comparar el árbol React nuevo con el anterior para decidir qué reutilizar, actualizar o destruir.

**Reglas clave:**

- Elementos de **distinto type** → desmonta el subtree completo y monta uno nuevo
- Mismo type → actualiza props in-place, recursivamente en hijos
- Listas → usa `key` para identificar items estables entre reorders/inserts/deletes

Complejidad O(n) heurística (no diff óptimo de edición de árbol). React 18+ puede interrumpir reconciliation en modo concurrente para priorizar input del usuario.

---

## 3. ¿Qué son las keys y por qué importan?

`key` es un identificador estable que React usa para mapear items entre renders en listas. Debe ser único entre hermanos y consistente mientras el item representa la misma entidad.

**Sin keys correctas:** al reordenar o filtrar, React puede reutilizar el componente equivocado → state incorrecto en inputs, animaciones rotas, bugs sutiles.

Usá IDs de dominio (`user.id`), no índices del array si la lista muta (insert/delete/reorder). El índice solo es aceptable en listas estáticas que nunca reordenan.

---

## 4. ¿Qué significa que React sea declarativo?

Declarativo = describís *qué* debe verse dado un state, no *cómo* mutar el DOM paso a paso.

**Comparación:**

- **Imperativo (jQuery):** `$('#btn').hide(); $('#msg').text('...')`
- **Declarativo (React):** `{isLoading ? <Spinner/> : <Content data={data}/>}`

React sincroniza la vista con el state. Vos modelás el UI como función del state. Esto reduce bugs de inconsistencia UI/state y facilita razonar sobre flujos.

---

## 5. ¿Qué diferencia hay entre controlled y uncontrolled components?

| | Controlled | Uncontrolled |
|---|---|---|
| **Fuente de verdad** | React (`value={state}` + `onChange`) | DOM (`ref.current.value`) |
| **Cada keystroke** | Pasa por React | React no controla cada cambio |

**Controlled** es el default recomendado: validación en tiempo real, values derivados, reset programático.

**Uncontrolled** tiene sentido en forms simples, integraciones con libs no-React, o file inputs.

**En RN:** `TextInput` controlled con `value` + `onChangeText`. Cuidado con performance en inputs muy frecuentes (considerar debounce o uncontrolled para casos extremos).

---

## 6. ¿Qué es lifting state up?

Patrón donde movés state compartido al **ancestro común más cercano** de los componentes que lo necesitan, y se lo pasás como props hacia abajo.

Evita duplicar state sincronizado entre hermanos (ej: temperatura en Celsius y Fahrenheit). Un solo state “source” y derivaciones/callbacks hacia los hijos.

Relacionado con “single source of truth” — no copies state entre componentes si podés elevarlo.

---

## 7. ¿Qué significa “single source of truth”?

Cada pieza de state debe vivir en **un solo lugar** del árbol (o store). Otros componentes la leen o derivan, pero no mantienen copias que puedan desincronizarse.

**En apps grandes escala a:**

| Dominio | Fuente típica |
|---|---|
| UI efímera | state local |
| Datos del servidor | React Query cache |
| State global | Redux / Zustand |

**Anti-pattern:** mismo dato en Redux + Context + state local del componente sin pipeline claro de quién es owner.

---

## 8. ¿Qué es composition vs inheritance en React?

React favorece **composición** sobre herencia de clases.

En lugar de extender `BaseModal extends React.Component`, componés:

```tsx
<Modal>
  <Modal.Header />
  <Modal.Body>{children}</Modal.Body>
</Modal>
```

**Mecanismos:** `children` · render props · slots nombrados · compound components · HOCs (menos idiomático hoy) · custom hooks (preferido para lógica compartida)

Herencia de clases para UI era frágil — composición es más flexible y explícita sobre qué se comparte.

---

## 9. ¿Qué son render props?

Patrón donde un componente recibe una **función** como prop (o como `children`) que recibe datos/comportamiento y devuelve React elements.

```tsx
<Mouse render={({ x, y }) => <Cursor x={x} y={y} />} />
```

Comparte lógica sin acoplar UI. Hoy muchas veces se reemplaza por custom hooks (`const { x, y } = useMouse()`) — más ergonómicos y componibles.

Render props siguen útiles cuando querés encapsular lógica *y* controlar el render desde el padre inline.

---

## 10. ¿Qué son Higher Order Components?

Un **HOC** es una función que recibe un componente y devuelve uno nuevo con props adicionales o comportamiento envuelto:

```tsx
withAuth(WrappedComponent)
```

**Casos históricos:** auth guards · inject de Redux (`connect`) · theming

**Problemas:** wrapper hell en DevTools · refs indirectas · props naming collisions · difícil tipar en TS

En código moderno: custom hooks + composición reemplazan la mayoría de HOCs. Saber explicarlos importa por legacy codebases y entrevistas.

---

## 11. ¿Qué ventajas tiene functional programming en React?

- Componentes como funciones puras del state/props → predecibles, fáciles de testear
- Inmutabilidad en updates de state → reconciliation eficiente, time-travel debugging en Redux
- Composición de funciones (hooks) vs jerarquías de herencia
- Funciones de orden superior (HOCs, custom hooks)
- Evitar efectos secundarios en render — side effects aislados en effects/event handlers

React no es FP puro (tiene state mutable interno, effects), pero el modelo mental funcional reduce bugs en UI compleja.

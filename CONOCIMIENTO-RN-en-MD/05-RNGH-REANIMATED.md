# React Native Gesture Handler & Reanimated

**React Native Gesture Handler (RNGH)** reemplaza el sistema de gestos default de React Native por uno más eficiente y nativo.

En vez de depender solo del responder system de React (`onPress`, `onTouchMove`, etc.), Gesture Handler maneja los gestos directamente desde el lado nativo (iOS/Android). Eso hace que los gestos sean:

- más fluidos
- más precisos
- menos propensos a lag
- compatibles con interacciones complejas

Se usa mucho para:

- drag & drop
- swipeables
- bottom sheets
- carousels
- pinch to zoom
- drawers
- mapas
- gestures simultáneos

---

## 1. Problema que resuelve Gesture Handler

Con los eventos touch tradicionales de React Native:

```tsx
<View
  onTouchMove={...}
  onTouchStart={...}
/>
```

todo pasa por el thread de JavaScript.

Si el JS thread está ocupado (renders, requests, lógica pesada, navegación, reconciliación), los gestos pueden trabarse.

Gesture Handler mueve gran parte de eso al lado nativo.

---

### 2. Gestos comunes

| Gesto | API | Uso |
|---|---|---|
| **Tap** | `Gesture.Tap()` | Toques simples |
| **Pan** | `Gesture.Pan()` | Drag — muy usado con Reanimated |
| **Long Press** | `Gesture.LongPress()` | Press prolongado |
| **Pinch** | `Gesture.Pinch()` | Zoom |
| **Rotation** | `Gesture.Rotation()` | Rotación |

Ejemplo Pan:

```tsx
Gesture.Pan().onUpdate((event) => {
  translateX.value = event.translationX;
});
```

Podés combinar gestos en paralelo o con exclusión:

```tsx
Gesture.Simultaneous(pan, pinch);
Gesture.Exclusive(doubleTap, singleTap);
```

---

## 3. Reanimated

**React Native Reanimated** es la librería de animaciones más importante del ecosistema React Native moderno.

La idea principal:

- ejecutar animaciones y lógica UI directamente en el **UI thread**
- evitar depender del **JS thread**

Eso permite:

- 60 FPS reales
- animaciones complejas
- gestures ultra fluidos
- shared element transitions
- physics animations

### 3.1. El problema del Animated viejo

El `Animated` clásico de React Native tenía limitaciones:

- muchas animaciones corrían en JS
- podía haber frame drops
- gestos complejos sufrían lag

Reanimated introduce:

- worklets
- shared values
- UI thread execution

### 3.2. Shared Values

Valores reactivos compartidos entre threads.

```tsx
const translateX = useSharedValue(0);

translateX.value = 100;
```

**NO genera un re-render React.** Eso es clave.

### 3.3. Worklets

Funciones que Reanimated ejecuta en el UI thread.

```tsx
.onUpdate((event) => {
  translateX.value = event.translationX;
})
```

Eso corre fuera del JS thread.

Antes había que usar `'worklet'` manualmente; hoy casi siempre es automático.

---

## 4. Gesture Handler + Reanimated

Van muy de la mano:

- **Gesture Handler** detecta el gesto
- **Reanimated** anima en el UI thread

Ejemplo típico:

```tsx
const translateX = useSharedValue(0);

const pan = Gesture.Pan().onUpdate((event) => {
  translateX.value = event.translationX;
});

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

return (
  <GestureDetector gesture={pan}>
    <Animated.View style={[styles.box, style]} />
  </GestureDetector>
);
```

Esto da una sensación totalmente nativa.

---

## 5. Threads en React Native moderno

Muy preguntable en entrevistas.

| Thread | Qué corre |
|---|---|
| **JS Thread** | lógica React, renders, fetches, state management |
| **UI Thread** | renderizado nativo, animaciones Reanimated, gestures |

La magia de Reanimated es mover trabajo crítico al UI thread.

---

## 6. Casos reales donde se usan

### Bottom Sheets

Swipe up/down, snapping, momentum.

Librerías como `@gorhom/bottom-sheet` usan ambos internamente.

### Navegación

React Navigation usa Gesture Handler para swipes, stack gestures y drawers.

### Carousels

Swipe horizontal + interpolaciones.

### Tinder-like cards

Pan gestures + springs + rotation.

---

## 7. Cosas importantes para mencionar en entrevistas

1. **Reanimated evita re-renders** — porque usa shared values.
2. **Corre en UI thread** — clave para performance.
3. **Gesture Handler evita depender del responder system JS.**
4. **Ambos son prácticamente estándar de la industria RN** — especialmente en apps complejas.
5. **Reanimated requiere Babel plugin** — normalmente `plugins: ['react-native-reanimated/plugin']` y suele ir último.
6. **Hermes mejora muchísimo la experiencia** — ayuda con performance y startup time.

---

## 8. Limitaciones / cosas a tener en cuenta

### Debugging

A veces es más difícil debuggear worklets.

### Curva de aprendizaje

Reanimated tiene APIs bastante distintas a React tradicional.

### Versiones

RN + Reanimated + Gesture Handler tienen compatibilidad sensible entre versiones.

---

## 9. Resumen “modo entrevista”

**React Native Gesture Handler** permite manejar gestos usando capacidades nativas en lugar del responder system tradicional de JS, lo que mejora muchísimo la fluidez y precisión.

**Reanimated** complementa eso ejecutando animaciones y lógica UI directamente en el UI thread mediante shared values y worklets, evitando depender del JS thread y permitiendo animaciones de 60 FPS incluso con gestures complejos.

En conjunto son la base de prácticamente toda interacción avanzada en apps React Native modernas.

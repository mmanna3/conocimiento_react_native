# Live coding — snippets y patrones

Bullets + código mínimo para repaso rápido en entrevista.

## debounce

Ejecuta la función **una vez** después de que el usuario dejó de disparar eventos durante `wait` ms.

```js
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
// Uso: const onSearch = debounce((q) => fetch(q), 300);
```

## throttle

Como máximo **una ejecución** cada `wait` ms (scroll, resize).

```js
function throttle(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}
```

## groupBy

Agrupa array de objetos por clave.

```js
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}
// groupBy(users, 'role') → { admin: [...], user: [...] }
```

## memoize

Cache por argumentos (primera llamada calcula, siguientes devuelven cache).

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

## array → objeto

Por clave única (índice por `id`):

```js
const byId = Object.fromEntries(items.map((i) => [i.id, i]));
// o reduce:
const byId = items.reduce((acc, i) => ({ ...acc, [i.id]: i }), {});
```

## objeto → array

```js
const list = Object.values(obj);
const entries = Object.entries(obj).map(([k, v]) => ({ key: k, ...v }));
```

## useDebounce

```js
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

## usePrevious

Valor del render anterior (comparar props, animaciones, diff).

```js
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

## useLocalStorage

Web; en RN reemplazar por AsyncStorage/MMKV con la misma API async o sync.

```js
function useLocalStorage(key, initial) {
  const [stored, setStored] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(stored));
  }, [key, stored]);
  return [stored, setStored];
}
```

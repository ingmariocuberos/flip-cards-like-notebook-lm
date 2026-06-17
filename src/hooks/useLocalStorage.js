import { useCallback, useEffect, useRef, useState } from 'react';

function read(key, initial) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return typeof initial === 'function' ? initial() : initial;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[useLocalStorage] failed to read "${key}":`, err);
    return typeof initial === 'function' ? initial() : initial;
  }
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  const keyRef = useRef(key);

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setValue(read(key, initial));
    }
  }, [key, initial]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[useLocalStorage] failed to write "${key}":`, err);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[useLocalStorage] failed to remove "${key}":`, err);
    }
  }, [key]);

  return [value, setValue, remove];
}

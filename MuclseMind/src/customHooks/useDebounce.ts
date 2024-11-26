import { useState, useEffect, useRef } from 'react';

export const useDebounce = <T>(value: T, delay = 500): T => {
  const debouncedValueRef = useRef<T | undefined>(undefined);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedValueRef.current = value;
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValueRef.current ?? debouncedValue};

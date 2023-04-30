import dynamic from 'next/dynamic';
// https://thomasderleth.de/keeping-react-state-and-local-storage-in-sync/
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
// const Window = dynamic(() => import("React"), { ssr: false });

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

function usePersistedState<T>(defaultValue: T, key: string): PersistedState<T> {
  const [value, setValue] = useState<T>(() => {
    let value;
    if (typeof window !== "undefined") value = localStorage.getItem(key);

    return value ? (JSON.parse(value) as T) : defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export { usePersistedState };

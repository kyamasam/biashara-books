"use client";

import { useEffect, useRef } from "react";

/** Debounces a search callback (e.g. a server-side catalogue lookup). */
export function useDebouncedSearch(callback: (query: string) => void, delay = 300) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (query: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(query.trim()), delay);
  };
}

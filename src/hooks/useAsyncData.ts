"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FetchResult<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

/**
 * Small fetch-on-mount hook with manual refresh, used by feature pages to
 * load Supabase data client-side. Previously loaded data stays visible while
 * a refresh is in flight.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [tick, setTick] = useState(0);
  const key = `${JSON.stringify(deps)}:${tick}`;

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [result, setResult] = useState<FetchResult<T>>({
    key: "",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setResult({
            key,
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const refresh = useCallback(async () => {
    setTick((t) => t + 1);
  }, []);

  const fresh = result.key === key;
  return {
    data: result.data,
    loading: !fresh && result.data === null,
    error: fresh ? result.error : null,
    refresh,
  };
}

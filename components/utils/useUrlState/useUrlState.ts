"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Read/write a handful of query params without touching history: the URL mirrors what the screen
 * shows, so a link reproduces the view. Empty or null values drop the param entirely.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      });
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, params],
  );

  return { params, setParams };
}

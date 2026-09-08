"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import { InternalApiClient } from "@/components/clients/apiClient";
import { UnauthorizedError } from "@/components/clients/exceptions";
import { AccessAction, AccessCheck, AccessScope, canAccess, EffectiveAccess, ResourceCode, } from "@/models/access";
import { accessQueryKeys } from "./accessQueryKeys";
import { clearPermissionsStorage, PERMISSIONS_STORAGE_KEY } from "./permissionsStorage";

type StorageSchema = {
  version: number;
  etag: string;
  payload: EffectiveAccess;
};

const STORAGE_VERSION = 2;

function loadFromStorage(): { etag: string | null; payload: EffectiveAccess | null } {
  if (typeof window === "undefined") return { etag: null, payload: null };
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (!raw) return { etag: null, payload: null };
    const data = JSON.parse(raw) as StorageSchema;
    if (data.version !== STORAGE_VERSION) {
      localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
      return { etag: null, payload: null };
    }
    return { etag: data.etag, payload: data.payload };
  } catch {
    return { etag: null, payload: null };
  }
}

function saveToStorage(etag: string, payload: EffectiveAccess) {
  try {
    const data: StorageSchema = { version: STORAGE_VERSION, etag, payload };
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Clears cached access and forces re-login. Only for places that know the session is gone —
// ordinary 401s are judged by the API client, which probes before throwing anyone out.
export function forceReauthRedirect() {
  clearPermissionsStorage();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function fetchMeAccess(internalApiClient: InternalApiClient): Promise<EffectiveAccess | null> {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path === "/login" || path.startsWith("/auth")) return null;

  // `has_session` is deliberately NOT consulted here.
  //
  // It is the only non-httpOnly cookie we set, which makes it the first one a script, an extension
  // or a partial "clear site data" removes -- while the session itself, `access_token` and
  // `refresh_token`, is httpOnly and survives. This function used to short-circuit on its absence
  // and return `null`, and `null` is also what "this person may do nothing" looks like, so every
  // gate on every page rendered "403 Access denied" against a perfectly good session. **A confident
  // answer to a question nobody asked.**
  //
  // Asking costs one request, and the request is the only thing that actually knows. If the session
  // really is gone the answer is a 401, and what to do about a 401 is decided in one place --
  // `InternalApiClient`, which refreshes, then probes, and only then redirects.

  const { etag, payload: cachedPayload } = loadFromStorage();

  const headers: HeadersInit = {};
  if (etag && cachedPayload) {
    headers["If-None-Match"] = etag;
  }

  try {
    const response = await internalApiClient.fetch("/me/access", { headers });

    if (response.status === 304) {
      return cachedPayload;
    }

    const payload = (await response.json()) as EffectiveAccess;
    const newEtag = response.headers.get("ETag");
    if (newEtag) {
      saveToStorage(newEtag, payload);
    }
    return payload;
  } catch (err) {
    // 401 here means the cached snapshot is worthless — drop it and answer "no access yet". Whether
    // this is a dead session or just a rotated perm-hash is decided in one place, the API client,
    // which redirects only after confirming the session is actually gone.
    if (err instanceof UnauthorizedError) {
      clearPermissionsStorage();
      return null;
    }
    throw err;
  }
}

export function useAccess() {
  const { internalApiClient } = useAppDataContext();

  const query = useQuery<EffectiveAccess | null>({
    queryKey: accessQueryKeys.meAccess(),
    queryFn: () => fetchMeAccess(internalApiClient),
    staleTime: 60_000,
    retry: false,
  });

  return {
    access: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    /**
     * We do not know what this person may do, as opposed to knowing they may not.
     *
     * Without this the two are the same value — `access: null` — and every gate concluded "no
     * permission". With the backend down that put "403 Access denied" on every page, which is a
     * confident answer to a question we could not ask.
     */
    unavailable: !!query.error && !query.data,
    refresh: query.refetch,
  };
}

export function useInvalidateAccessQuery() {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    clearPermissionsStorage();
    await queryClient.invalidateQueries({ queryKey: accessQueryKeys.meAccess() });
  }, [queryClient]);
}

export function useCanAccess(resource: ResourceCode, action: AccessAction, scope?: AccessScope): boolean {
  const { access } = useAccess();
  return canAccess({ access, resource, action, scope });
}

export function useCanAny(checks: AccessCheck[]): boolean {
  const { access } = useAccess();
  return checks.some((check) => canAccess({ access, ...check }));
}

export function useCanAll(checks: AccessCheck[]): boolean {
  const { access } = useAccess();
  return checks.every((check) => canAccess({ access, ...check }));
}

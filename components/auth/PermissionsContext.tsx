"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAppDataContext } from "@/components/providers/AppDataProvider/AppDataProvider";
import { ForbiddenError, UnauthorizedError } from "@/components/clients/exceptions";

// --- Types ---
export type PermissionLevel = "none" | "view" | "edit" | "manage";

export type PermissionPayload = {
  modules: Record<string, PermissionLevel>;
  userFields: Record<string, PermissionLevel>;
  tenant_name: string;
  perm_hash: string;
};

type PermissionsState = {
  permissions: PermissionPayload | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
  canModule: (module: string, level: "view" | "edit" | "manage") => boolean;
  canField: (field: string, level?: "view" | "edit" | "manage") => boolean;
};

// --- Storage Constants ---
const STORAGE_KEY = "hris_permissions_v1";

type StorageSchema = {
  version: number;
  etag: string;
  payload: PermissionPayload;
};

const LEVELS: Record<PermissionLevel, number> = {
  "none": 0,
  "view": 1,
  "edit": 2,
  "manage": 3
};

// --- Context ---
const PermissionsContext = createContext<PermissionsState | null>(null);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { internalApiClient } = useAppDataContext();
  const [permissions, setPermissions] = useState<PermissionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // --- Helpers ---
  const loadFromStorage = useCallback((): { etag: string | null; payload: PermissionPayload | null } => {
    if (typeof window === "undefined") return { etag: null, payload: null };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { etag: null, payload: null };
      const data = JSON.parse(raw) as StorageSchema;
      if (data.version !== 1) {
        localStorage.removeItem(STORAGE_KEY);
        return { etag: null, payload: null };
      }
      return { etag: data.etag, payload: data.payload };
    } catch {
      return { etag: null, payload: null };
    }
  }, []);

  const saveToStorage = useCallback((etag: string, payload: PermissionPayload) => {
    try {
      const data: StorageSchema = { version: 1, etag, payload };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save permissions", e);
    }
  }, []);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const target = "/login";
    if (path !== target) {
      window.location.href = target;
    }
  }, [clearStorage]);


  // --- Fetch Logic ---
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      if (path === "/login" || path.startsWith("/auth") || path.startsWith("/me")) {
        setPermissions(null);
        return;
      }
      const hasSession =
        typeof document !== "undefined" &&
        document.cookie.split(";").some((c) => c.trim().startsWith("has_session="));
      if (!hasSession) {
        setPermissions(null);
        return;
      }
      const { etag, payload: cachedPayload } = loadFromStorage();

      if (cachedPayload) {
        setPermissions(cachedPayload);
      }

      const headers: HeadersInit = {};
      if (etag && cachedPayload) {
        headers["If-None-Match"] = etag;
      }

      const response = await internalApiClient.fetch("/me/permissions", { headers });

      if (response.status === 304) {
        if (!cachedPayload) {
          setPermissions(null);
        } else {
          setPermissions(cachedPayload);
        }
        return;
      }

      const newPayload = await response.json() as PermissionPayload;
      const newEtag = response.headers.get("ETag");

      if (newPayload) {
        setPermissions(newPayload);
        if (newEtag) {
          saveToStorage(newEtag, newPayload);
        }
      }

    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) {
        const path = typeof window !== "undefined" ? window.location.pathname : "";
        if (path !== "/login") {
          logout();
        }
        return;
      }
      // If 404/500 -> deny by default (permissions=null)
      // Note: we clear permissions on error to fail safe.
      setPermissions(null);

      if (err instanceof ForbiddenError) {
        setError(err);
      } else {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Failed to load permissions", err);
      }
    } finally {
      setLoading(false);
    }
  }, [internalApiClient, loadFromStorage, saveToStorage, logout]);

  const refresh = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);


  // --- Init ---
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);


  // --- Checks ---
  const checkLevel = (userLevel: PermissionLevel, requiredLevel: "view" | "edit" | "manage") => {
    return LEVELS[userLevel] >= LEVELS[requiredLevel];
  };

  const can = useCallback((permission: string): boolean => {
    if (!permissions) return false;

    // Format: PERM_PEOPLE_VIEW
    if (!permission.startsWith("PERM_")) return false;
    const core = permission.substring(5); // PEOPLE_VIEW
    const parts = core.split("_");

    const levelRaw = parts.pop()?.toLowerCase(); // view
    const module = parts.join("_"); // PEOPLE

    if (!levelRaw || !["view", "edit", "manage"].includes(levelRaw)) return false;

    return canModule(module, levelRaw as "view" | "edit" | "manage");
  }, [permissions]);

  const canModule = useCallback((module: string, level: "view" | "edit" | "manage"): boolean => {
    if (!permissions) return false;
    const userLevel = permissions.modules[module] || "none";
    return checkLevel(userLevel, level);
  }, [permissions]);

  const canField = useCallback((field: string, level: "view" | "edit" | "manage" = "view"): boolean => {
    if (!permissions) return false;
    const userLevel = permissions.userFields[field] || "none";
    return checkLevel(userLevel, level);
  }, [permissions]);

  const value = useMemo(() => ({
    permissions,
    loading,
    error,
    refresh,
    can,
    canModule,
    canField
  }), [permissions, loading, error, refresh, can, canModule, canField]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionsProvider");
  return ctx;
};

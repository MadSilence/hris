export const PERMISSIONS_STORAGE_KEY = "hris_permissions_v1";

export function clearPermissionsStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

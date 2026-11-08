/**
 * What changed in a version (K7), as the backend stores it on the version: JSON
 * `{ trigger, whoItRunsFor, added, removed, changed }`; null on the first version. Read defensively — an old or
 * unreadable summary words as nothing rather than breaking the window.
 */
export type VersionChange =
  | { kind: "turnedOn" }
  | { kind: "trigger" }
  | { kind: "whoItRunsFor" }
  | { kind: "added" | "removed" | "changed"; count: number }
  | { kind: "noChanges" };

const count = (value: unknown): number => {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

export const versionChanges = (summary: string | null | undefined): VersionChange[] => {
  if (summary == null || summary.trim() === "") return [{ kind: "turnedOn" }];
  let parsed: unknown;
  try {
    parsed = JSON.parse(summary);
  } catch {
    return [{ kind: "noChanges" }];
  }
  if (!parsed || typeof parsed !== "object") return [{ kind: "noChanges" }];
  const s = parsed as Record<string, unknown>;
  const out: VersionChange[] = [];
  if (s.trigger === true) out.push({ kind: "trigger" });
  if (s.whoItRunsFor === true) out.push({ kind: "whoItRunsFor" });
  for (const kind of ["added", "removed", "changed"] as const) {
    const n = count(s[kind]);
    if (n > 0) out.push({ kind, count: n });
  }
  return out.length > 0 ? out : [{ kind: "noChanges" }];
};

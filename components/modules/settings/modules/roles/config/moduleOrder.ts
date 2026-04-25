export const moduleOrder: string[] = [
  "PEOPLE",
  "ROLES",
  "ATTRIBUTES",
  "LEGAL_ENTITIES",
  "OFFICES",
  "JOB_CATALOG",
  "TIME_OFF",
];

export function orderModules(mods: Record<string, string>): string[] {
  const keys = Object.keys(mods);
  const known = moduleOrder.filter((m) => keys.includes(m));
  const unknown = keys.filter((k) => !moduleOrder.includes(k)).sort();
  return [...known, ...unknown];
}

import { Filter } from "@/components/models/filters";

export const countSelectedColumns = (columns: { checked: boolean }[]) =>
  columns.filter((c) => c.checked).length;

export function formatFilterValue(f: Filter): string {
  if (Array.isArray((f as any).values) && (f as any).values.length) {
    return `[${(f as any).values.join(", ")}]`;
  }
  if ((f as any).op === "between") {
    return `${(f as any).value}..${(f as any).valueTo}`;
  }
  return String((f as any).value ?? "");
}

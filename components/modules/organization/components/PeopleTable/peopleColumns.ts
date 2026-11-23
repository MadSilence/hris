/**
 * The widths of the known system columns (the designers' round 2, PE2 — the Documents rule): Email ~240, Status ~140,
 * a date ~110. Name and every other column have none, so Name takes the free width and cuts with … only when it really
 * does not fit. Set on the header, which is what a fixed table takes its widths from.
 */
const SYSTEM_COLUMN_WIDTHS: Record<string, string> = {
  email: "w-60",
  status: "w-35",
  created_at: "w-[110px]",
  updated_at: "w-[110px]",
  hire_date: "w-[110px]",
  probation_end: "w-[110px]",
  termination_date: "w-[110px]",
  date_of_birth: "w-[110px]",
};

export function columnWidthClass(id: string): string | undefined {
  const key = id.startsWith("sys:") ? id.slice(4) : null;
  return key ? SYSTEM_COLUMN_WIDTHS[key] : undefined;
}

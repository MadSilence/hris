// Past the `runs` barrel on purpose: it also exports the run windows, which pull server code into a plain helper.
import { toInstant } from "@/components/modules/automations/runs/runWords";

/**
 * "2h ago", "3 days ago" — the page's language. The backend's timestamps are UTC with no zone suffix; read through
 * `toInstant`, not `new Date`, which took them for local time and said "1 hr ago" of a minute-old request in Warsaw
 * (walk of 2026-11-11).
 */
export const ago = (iso: string | null | undefined, locale?: string, now: number = Date.now()) => {
  const at = toInstant(iso);
  if (!at) return "";
  const minutes = Math.round((now - at.getTime()) / 60_000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (minutes < 60) return format.format(-Math.max(minutes, 1), "minute");
  if (minutes < 60 * 24) return format.format(-Math.round(minutes / 60), "hour");
  return format.format(-Math.round(minutes / (60 * 24)), "day");
};

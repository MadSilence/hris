import type { HolidayCalendarBindingKind, HolidayCalendarBindingPreview } from "@/models/publicHolidays/binding";

const people = (n: number) => (n === 1 ? "1 person" : `${n} people`);

/** Whom a more specific binding reaches instead, worded for the binding being set. */
const moreSpecific = (kind: HolidayCalendarBindingKind) =>
  kind === "LEGAL_ENTITY" ? "their office's calendar" : "their office's or legal entity's calendar";

/**
 * The preview as sentences — "12 people will get Germany 2026. 3 people already have it by hand and will
 * now inherit it. 2 people keep their own calendar as an override." A line with nothing to say is left out.
 */
export const previewLines = (preview: HolidayCalendarBindingPreview, currentCalendarName: string | null): string[] => {
  if (!preview.calendarId) {
    if (preview.losing === 0) return ["Nobody inherits a calendar from here now, so nothing changes for anyone."];
    return [
      `${people(preview.losing)} will stop inheriting ${currentCalendarName ?? "this calendar"} from today and fall back to the next binding down, if there is one.`,
    ];
  }
  const name = preview.calendarName ?? "this calendar";
  if (preview.members === 0) return [`Nobody works here yet. Whoever joins will get ${name}.`];
  const lines: string[] = [];
  if (preview.willInherit > 0) {
    lines.push(`${people(preview.willInherit)} will get ${name}.`);
  }
  if (preview.alreadyByHand > 0) {
    lines.push(`${people(preview.alreadyByHand)} already ${preview.alreadyByHand === 1 ? "has" : "have"} it by hand and will now inherit it.`);
  }
  if (preview.keepOwn > 0) {
    lines.push(`${people(preview.keepOwn)} ${preview.keepOwn === 1 ? "keeps" : "keep"} their own calendar as an override.`);
  }
  if (preview.outranked > 0) {
    lines.push(`${people(preview.outranked)} ${preview.outranked === 1 ? "keeps" : "keep"} ${moreSpecific(preview.kind)}, which comes first.`);
  }
  return lines;
};

import type { useTranslations } from "next-intl";
import type { HolidayCalendarBindingPreview } from "@/models/publicHolidays/binding";

type TimeOffT = ReturnType<typeof useTranslations<"timeOff">>;

/**
 * The preview as sentences — "12 people will get Germany 2026. 3 people already have it by hand and will
 * now inherit it. 2 people keep their own calendar as an override." A line with nothing to say is left out.
 */
export const previewLines = (
  preview: HolidayCalendarBindingPreview,
  currentCalendarName: string | null,
  t: TimeOffT,
): string[] => {
  if (!preview.calendarId) {
    if (preview.losing === 0) return [t("binding.preview.nothingChanges")];
    return [
      t("binding.preview.losing", {
        count: preview.losing,
        name: currentCalendarName ?? t("binding.preview.thisCalendar"),
      }),
    ];
  }
  const name = preview.calendarName ?? t("binding.preview.thisCalendar");
  if (preview.members === 0) return [t("binding.preview.nobodyYet", { name })];
  const lines: string[] = [];
  if (preview.willInherit > 0) {
    lines.push(t("binding.preview.willGet", { count: preview.willInherit, name }));
  }
  if (preview.alreadyByHand > 0) {
    lines.push(t("binding.preview.alreadyByHand", { count: preview.alreadyByHand }));
  }
  if (preview.keepOwn > 0) {
    lines.push(t("binding.preview.keepOwn", { count: preview.keepOwn }));
  }
  if (preview.outranked > 0) {
    // Whom a more specific binding reaches instead, worded for the binding being set.
    lines.push(t("binding.preview.outranked", { count: preview.outranked, kind: preview.kind }));
  }
  return lines;
};

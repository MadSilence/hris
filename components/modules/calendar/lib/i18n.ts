import type { useTranslations } from "next-intl";

/** The `calendar` translator, for the pure helpers that build a sentence outside a component. */
export type CalendarTranslator = ReturnType<typeof useTranslations<"calendar">>;

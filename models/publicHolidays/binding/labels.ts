import type { HolidayCalendarBindingRef } from "./index";

/** "office: Berlin", "legal entity: Acme UK Ltd", "the company default" — a binding named inside a sentence. */
export const bindingSourceLabel = (ref: Pick<HolidayCalendarBindingRef, "kind" | "name">): string => {
  switch (ref.kind) {
    case "OFFICE":
      return `office: ${ref.name ?? "an office"}`;
    case "LEGAL_ENTITY":
      return `legal entity: ${ref.name ?? "a legal entity"}`;
    case "COMPANY_DEFAULT":
      return "the company default";
  }
};

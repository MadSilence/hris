import type { useTranslations } from "next-intl";

/** What `useTranslations("access")` returns — the type a helper outside a component takes. */
export type AccessTranslator = ReturnType<typeof useTranslations<"access">>;

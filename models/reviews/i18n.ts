import type { useTranslations } from "next-intl";

/** The `reviews` namespace's translator, for code that is not a component (technical_documentation/I18N.md). */
export type ReviewsT = ReturnType<typeof useTranslations<"reviews">>;

/** The shared `common` namespace's translator. */
export type CommonT = ReturnType<typeof useTranslations<"common">>;

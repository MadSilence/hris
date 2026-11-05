import type { useTranslations } from "next-intl";

/** The `reviews` namespace's translator, for code that is not a component (technical_design/I18N_DESIGN.md). */
export type ReviewsT = ReturnType<typeof useTranslations<"reviews">>;

/** The shared `common` namespace's translator. */
export type CommonT = ReturnType<typeof useTranslations<"common">>;

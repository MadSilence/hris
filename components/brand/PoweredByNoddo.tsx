import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";
import { NoddoWordmark } from "./NoddoWordmark";

/*
 * "powered by noddo" (SPEC § 2): a 12 px gray label beside a 12 px-high wordmark, in the footer of a company's
 * own screens — its sign-in, its pre-boarding page. Never next to the company logo. `onColor` is for the
 * company colour, where the lockup turns one colour.
 */
export function PoweredByNoddo({ className, onColor = false }: { className?: string; onColor?: boolean }) {
  const t = useTranslations("common");
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-hint", onColor ? "text-on-accent" : "text-tertiary", className)}>
      {t("brand.poweredBy")}
      <NoddoWordmark tone="mono" height={12} />
    </span>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";

/**
 * The secondary way out of an error page: back where the reader came from, or home when there is no history.
 * Plain `history`, not the router: an error page can render where no app router is mounted (the root 404).
 */
export function GoBackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  const t = useTranslations("common");
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign(fallback))}
    >
      {t("actions.goBack")}
    </Button>
  );
}

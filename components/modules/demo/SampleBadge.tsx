"use client";

import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * The *Sample* mark on a person (DEMO_PLAN.md 4.3, the owner's B1): made by the example data, or added in a demo, and
 * deleted when the company goes live. An information chip — not a status of the person, so none of the person's
 * status colours.
 */
export function SampleBadge({ className }: { className?: string }) {
  const t = useTranslations("demo.sample");
  return <StatusBadge status="info" label={t("chip")} className={className} />;
}

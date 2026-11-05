import * as React from "react";
import { useTranslations } from "next-intl";
import { useDateFormatter } from "@/lib/date";
import type { PendingStep } from "./scheduledChangeText";

/**
 * A field that is going to change: `current → new from <date>`, the second half muted — a value that
 * is not yet true is muted (`ui/DESIGN_SYSTEM.md`). With no steps it is the current value, untouched.
 */
export const PendingValue: React.FC<{ steps: PendingStep[]; children: React.ReactNode }> = ({ steps, children }) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  if (steps.length === 0) return <>{children}</>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {children}
      {steps.map((step) => (
        <span key={step.date} className="text-body text-tertiary" data-test="pending-change">
          {t("profile.scheduled.pendingStep", { value: step.label, date: formatDisplayDate(step.date, { style: "medium" }) })}
        </span>
      ))}
    </span>
  );
};

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/desact/checkbox";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DaysInput } from "./parts";

export type Direction = "BEFORE" | "AFTER";

/**
 * Days relative to a date (PRODUCT-RULES § Controls): [N days] and Before / After side by side, with no label over
 * them, and — where the date itself is a choice — "On the day" under them, which disables both.
 */
export const RelativeDays: React.FC<{
  days: number | null | undefined;
  direction: Direction | null;
  onDays: (days: number | null) => void;
  onDirection: (direction: Direction) => void;
  /** Present when "On the day" is offered. */
  onTheDay?: { checked: boolean; onChange: (checked: boolean) => void };
  invalid?: boolean;
}> = ({ days, direction, onDays, onDirection, onTheDay, invalid }) => {
  const t = useTranslations("automationsSettings");
  const id = React.useId();
  const off = onTheDay?.checked ?? false;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <DaysInput value={days} onChange={onDays} disabled={off} invalid={invalid} aria-label={t("common.howManyDays")} />
        <SegmentedControl<Direction>
          aria-label={t("common.beforeOrAfter")}
          value={off ? null : direction}
          onChange={onDirection}
          disabled={off}
          options={[
            { value: "BEFORE", label: t("common.before") },
            { value: "AFTER", label: t("common.after") },
          ]}
        />
      </div>
      {onTheDay && (
        <label htmlFor={`${id}-on`} className="flex w-fit cursor-pointer items-center gap-2 text-body text-primary">
          <Checkbox id={`${id}-on`} checked={onTheDay.checked} onCheckedChange={(c) => onTheDay.onChange(c === true)} />
          {t("common.onTheDay")}
        </label>
      )}
    </div>
  );
};

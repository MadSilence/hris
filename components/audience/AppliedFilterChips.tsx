"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { buildAudienceFields, type AudienceField } from "@/components/audience/fieldCatalog";
import { useFilterValueLabel } from "@/components/audience/hooks/useFilterValueLabel";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { cn } from "@/lib/cn";

/** How many applied conditions show as chips before "+N more" (N09c), unless a toolbar asks for fewer. */
export const APPLIED_CHIPS_SHOWN = 3;

const chipClasses =
  "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border border-field bg-card text-label text-tertiary";

/**
 * One applied condition in a toolbar (N09c): an outlined white pill, 32 high — the field in tertiary, the value in
 * 500 Ink ("Team **Design**"), then ×. Not a `FilterChip`, which is a choice that is on or off (DESIGN_SYSTEM § 5):
 * this one says what narrows the list and takes it off. An operator other than "is" is said between the two
 * ("Office is not Vilnius").
 */
export const AppliedFilterChip: React.FC<{
  filter: FilterDTO;
  field: AudienceField | null;
  dto: FieldDTO | null;
  onRemove: () => void;
  /** Set to show a leading mark, such as a policy's `PolicyMarker`. */
  icon?: React.ReactNode;
}> = ({ filter, field, dto, onRemove, icon }) => {
  const t = useTranslations("access");
  const value = useFilterValueLabel(field, dto, filter);
  const fieldLabel = field?.label ?? filter.field;
  const plainIs = filter.op === "eq" || filter.op === "in";
  return (
    <span className={cn(chipClasses, "pr-2 pl-3")}>
      <span>
        {fieldLabel}
        {plainIs ? null : ` ${t(`audience.operatorWords.${filter.op}`)}`}
      </span>
      {icon}
      <span className="max-w-48 truncate font-medium text-primary">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("audience.filter.removeChip", { field: fieldLabel })}
        className="flex rounded-pill text-tertiary outline-none hover:text-secondary focus-visible:shadow-focus"
      >
        <Icon icon={Cancel01Icon} size="sm" className="size-3.5" />
      </button>
    </span>
  );
};

/**
 * The conditions in force, beside the Filter button (N09c): the first three as {@link AppliedFilterChip}s, then an
 * outlined "+N more" that opens the filter with all of them, then "Clear all" (ghost sm).
 */
export const AppliedFilterChips: React.FC<{
  fields: FieldDTO[] | undefined;
  value: FilterDTO[];
  onChange: (next: FilterDTO[]) => void;
  /** "+N more" — opens the filter's popover. */
  onShowAll: () => void;
  /** The "+N more" chip is pressed in while the popover it opened is open. */
  showingAll?: boolean;
  /**
   * How many chips before "+N more" — three by default. A crowded toolbar asks for fewer so it keeps one line (the
   * calendar's, W3); zero folds every condition into "+N more".
   */
  shown?: number;
}> = ({ fields, value, onChange, onShowAll, showingAll = false, shown = APPLIED_CHIPS_SHOWN }) => {
  const t = useTranslations("access");
  const { access } = useAccess();
  const catalog = React.useMemo(
    () => buildAudienceFields(fields, (resource) => canAccess({ access, resource, action: "VIEW" })),
    [fields, access],
  );
  if (value.length === 0) return null;
  const limit = Math.max(0, shown);
  const hidden = value.length - limit;

  return (
    <>
      {value.slice(0, limit).map((filter, i) => (
        <AppliedFilterChip
          key={`${filter.field}-${i}`}
          filter={filter}
          field={catalog.find((f) => f.key === filter.field) ?? null}
          dto={fields?.find((f) => f.id === filter.field) ?? null}
          onRemove={() => onChange(value.filter((_, j) => j !== i))}
        />
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={onShowAll}
          className={cn(
            chipClasses,
            "px-3 font-medium text-primary outline-none hover:border-strong focus-visible:border-accent focus-visible:shadow-focus",
            showingAll && "border-accent shadow-focus",
          )}
        >
          {t("audience.filter.more", { count: hidden })}
        </button>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
        {t("audience.filter.clearAll")}
      </Button>
    </>
  );
};

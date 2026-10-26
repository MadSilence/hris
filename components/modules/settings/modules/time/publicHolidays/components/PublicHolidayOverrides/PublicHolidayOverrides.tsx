"use client";

import { FC } from "react";
import { Undo2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { PublicHolidayOverride } from "@/models/publicHolidays/holiday";
import { formatDisplayDate } from "@/lib/date";

const day = (iso: string | null) => formatDisplayDate(iso, { style: "medium" });

const span = (start: string | null, end: string | null) =>
  !end || end === start ? day(start) : `${day(start)} – ${day(end)}`;

/** What the provider says about an overridden day, in a sentence — the marker's tooltip. */
export const describeProviderVersion = (override: PublicHolidayOverride): string =>
  override.providerPresent
    ? `The provider has ${override.providerName ?? "this day"} on ${span(override.providerHolidayDate, override.providerEndDate)}.`
    : "The provider no longer lists this day.";

/**
 * The quiet mark on a provider's day the company changed. It says nothing loud — the day is the
 * company's and in force — but pointing at it tells what the provider has instead.
 */
export const PublicHolidayEditedMarker: FC<{ override: PublicHolidayOverride }> = ({ override }) => (
  <span
    className="ml-2 text-xs font-normal text-brown-400"
    title={`Edited by your company. ${describeProviderVersion(override)}`}
  >
    Edited
  </span>
);

/** The row's kebab: the one thing to do with an override is to take it back. */
export const PublicHolidayOverrideRowActions: FC<{
  override: PublicHolidayOverride;
  disabled?: boolean;
  onRevert: (override: PublicHolidayOverride) => void;
}> = ({ override, disabled, onRevert }) => (
  <RowActionsMenu label="Holiday actions" disabled={disabled}>
    <RowAction
      icon={<Undo2 className="h-4 w-4 text-muted-foreground" />}
      onClick={() => onRevert(override)}
      title={describeProviderVersion(override)}
    >
      Revert to Provider
    </RowAction>
  </RowActionsMenu>
);

/**
 * Provider days the company removed. They have no row in the calendar any more, so without this list
 * there would be no way to see them — or to bring one back.
 */
export const RemovedProviderDays: FC<{
  overrides: PublicHolidayOverride[];
  canRevert: boolean;
  disabled?: boolean;
  onRevert: (override: PublicHolidayOverride) => void;
}> = ({ overrides, canRevert, disabled, onRevert }) => {
  if (overrides.length === 0) return null;

  return (
    <section className="flex-none space-y-2" aria-label="Removed Provider Days">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Removed Provider Days</h3>
        <p className="text-sm text-muted-foreground">
          The provider lists these days; your company removed them from this calendar.
        </p>
      </div>
      <ul className="divide-y divide-brown-100">
        {overrides.map((override) => (
          <li key={override.id} className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{override.providerName}</span>
              {" · "}
              {span(override.providerHolidayDate, override.providerEndDate)}
            </span>
            {canRevert && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={disabled}
                onClick={() => onRevert(override)}
              >
                <Undo2 className="h-4 w-4" />
                Revert to Provider
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

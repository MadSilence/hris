"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Undo02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { PublicHolidayOverride } from "@/models/publicHolidays/holiday";
import { formatDisplayDate, useDisplayLanguage } from "@/lib/date";

const day = (iso: string | null, language?: string) => formatDisplayDate(iso, { style: "medium", language });

const span = (start: string | null, end: string | null, language?: string) =>
  !end || end === start ? day(start, language) : `${day(start, language)} – ${day(end, language)}`;

/** What the provider says about an overridden day, in a sentence — the marker's tooltip. */
export const describeProviderVersion = (
  override: PublicHolidayOverride,
  t: ReturnType<typeof useTranslations<"timeOff">>,
  language?: string,
): string =>
  override.providerPresent
    ? t("publicHolidays.overrides.providerHas", {
        name: override.providerName ?? t("publicHolidays.overrides.thisDay"),
        span: span(override.providerHolidayDate, override.providerEndDate, language),
      })
    : t("publicHolidays.overrides.providerDropped");

/**
 * The quiet mark on a provider's day the company changed. It says nothing loud — the day is the
 * company's and in force — but pointing at it tells what the provider has instead.
 */
export const PublicHolidayEditedMarker: FC<{ override: PublicHolidayOverride }> = ({ override }) => {
  const t = useTranslations("timeOff");
  const language = useDisplayLanguage();
  return (
    <span
      className="ml-2 text-hint font-normal text-tertiary"
      title={t("publicHolidays.overrides.editedTitle", { provider: describeProviderVersion(override, t, language) })}
    >
      {t("publicHolidays.overrides.edited")}
    </span>
  );
};

/** The row's kebab: the one thing to do with an override is to take it back. */
export const PublicHolidayOverrideRowActions: FC<{
  override: PublicHolidayOverride;
  disabled?: boolean;
  onRevert: (override: PublicHolidayOverride) => void;
}> = ({ override, disabled, onRevert }) => {
  const t = useTranslations("timeOff");
  const language = useDisplayLanguage();
  return (
    <RowActionsMenu label={t("publicHolidays.overrides.rowActions")} disabled={disabled}>
      <RowAction
        icon={<Icon icon={Undo02Icon} size="sm" className="text-tertiary" />}
        onClick={() => onRevert(override)}
        title={describeProviderVersion(override, t, language)}
      >
        {t("publicHolidays.overrides.revert")}
      </RowAction>
    </RowActionsMenu>
  );
};

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
  const t = useTranslations("timeOff");
  const language = useDisplayLanguage();
  if (overrides.length === 0) return null;

  return (
    <section className="flex-none space-y-2" aria-label={t("publicHolidays.overrides.removedTitle")}>
      <div>
        <h3 className="text-body font-semibold text-primary">{t("publicHolidays.overrides.removedTitle")}</h3>
        <p className="text-body text-tertiary">
          {t("publicHolidays.overrides.removedHint")}
        </p>
      </div>
      <ul className="divide-y divide-divider">
        {overrides.map((override) => (
          <li key={override.id} className="flex items-center justify-between gap-4 py-1.5 text-body">
            <span className="text-tertiary">
              <span className="font-medium text-primary">{override.providerName}</span>
              {" · "}
              {span(override.providerHolidayDate, override.providerEndDate, language)}
            </span>
            {canRevert && (
              <Button type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={disabled}
                onClick={() => onRevert(override)}
              >
                <Icon icon={Undo02Icon} size="sm" />
                {t("publicHolidays.overrides.revert")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

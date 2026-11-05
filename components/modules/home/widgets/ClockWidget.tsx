"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDateFormatter, useDisplayLocale } from "@/lib/date";
import { useUserSettings } from "@/components/modules/firstRun/hooks";
import { isoDateInZone, timeInZone, weekdayOf } from "@/components/modules/home/utils/zonedTime";
import { HomeCard } from "@/components/modules/home/components/HomeCard";

const TICK_MS = 15_000;

/**
 * The company's local time — what "today" means everywhere in the product. When the reader has chosen a zone
 * of their own and it differs, their time is beside it, so a person in another city sees both clocks.
 */
export const ClockWidget: React.FC = () => {
  const formatDisplayDate = useDateFormatter();
  const locale = useDisplayLocale();
  const t = useTranslations("home");
  const settings = useUserSettings();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const companyZone = settings.data?.companyTimeZone ?? null;
  const ownZone = settings.data?.timeZone ?? null;
  const today = isoDateInZone(now, companyZone);

  return (
    <HomeCard title={t("widgets.companyTime.title")}>
      {settings.isLoading ? (
        <Skeleton className="h-12 w-40" />
      ) : settings.error ? (
        <ErrorState error={settings.error} compact onRetry={() => void settings.refetch()} />
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-page-title tabular-nums text-primary" data-testid="company-clock">
            {timeInZone(now, companyZone, locale)}
          </p>
          <p className="text-body text-tertiary">
            {weekdayOf(today, locale)}, {formatDisplayDate(today, { style: "medium" })} · {companyZone ?? "UTC"}
          </p>
          {ownZone && ownZone !== companyZone && (
            <p className="text-hint text-tertiary">
              {t("clock.yourTime", { time: timeInZone(now, ownZone, locale), zone: ownZone })}
            </p>
          )}
        </div>
      )}
    </HomeCard>
  );
};

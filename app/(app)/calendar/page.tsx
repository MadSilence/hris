"use client";

import { useTranslations } from "next-intl";
import { PageGate } from "@/components/auth/PageGate";
import { CompanyCalendarBoardContainer } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/CompanyCalendarBoardContainer";

export default function CalendarPage() {
  const t = useTranslations("calendar");
  return (
    <PageGate resource="PEOPLE.CALENDAR" action="VIEW">
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-5">
        <section className="flex flex-none flex-col gap-2">
          <h1 className="text-page-title">{t("page.title")}</h1>
          <p className="max-w-2xl text-tertiary">
            {t("page.description")}
          </p>
        </section>

        <div className="min-h-0 flex-1">
          <CompanyCalendarBoardContainer />
        </div>
      </div>
    </PageGate>
  );
}

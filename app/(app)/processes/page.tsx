import { getTranslations } from "next-intl/server";
import { PageGate } from "@/components/auth/PageGate";
import { ProcessesListContainer } from "@/components/modules/lifecycle/processes/ProcessesListContainer";

export default async function ProcessesPage() {
  const t = await getTranslations("lifecycle");
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="VIEW">
      {/* Full height for the same reason as Tasks — see that page. `6rem` is the shell's padding. */}
      <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-6xl flex-col gap-4">
        <div className="shrink-0">
          <h1 className="text-page-title text-primary">{t("pages.processesTitle")}</h1>
          <p className="mt-1 text-body text-tertiary">{t("pages.processesDescription")}</p>
        </div>
        <ProcessesListContainer />
      </div>
    </PageGate>
  );
}

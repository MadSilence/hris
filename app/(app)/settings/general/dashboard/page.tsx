import { getTranslations } from "next-intl/server";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { BirthdayField } from "@/components/modules/settings/modules/general/home";

/**
 * Settings → General → Home: what the company decides about everybody's home. Today that is one thing, the
 * field birthdays come from (sitting 2, H7); how each person arranges their own home is theirs, on home itself.
 * The route keeps its old name — it was the "Dashboard" placeholder, and home itself still lives at `/dashboard`.
 */
const HomeSettingsPage = async () => {
  const t = await getTranslations("settings");
  return (
  <PageGate resource="SETTINGS.GENERAL" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title={t("menu.items.home")} backHref="/settings"/>

        <PageDescription className="text-body text-tertiary/90">
          {t("home.description")}
        </PageDescription>
      </div>

      <div className="space-y-10 px-8">
        <BirthdayField/>
      </div>
    </div>
  </PageGate>
  );
};

export default HomeSettingsPage;

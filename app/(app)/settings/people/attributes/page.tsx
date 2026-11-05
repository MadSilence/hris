import {
  PersonFieldsTabs,
} from "@/components/modules/settings/modules/attributes/components/PersonFieldsTabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { getTranslations } from "next-intl/server";

const AttributesSettingsPage = async () => {
  const t = await getTranslations("settings.pages.attributes");
  return (
  <PageGate resource="PEOPLE.ATTRIBUTES" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title={t("title")} backHref="/settings"/>

        <PageDescription className="text-body text-tertiary/90">
          {t.rich("description", { b: (chunks) => <span className="font-medium">{chunks}</span> })}
        </PageDescription>
      </div>

      <div className="px-8">
        <PersonFieldsTabs/>
      </div>
    </div>
  </PageGate>
  );
};

export default AttributesSettingsPage;

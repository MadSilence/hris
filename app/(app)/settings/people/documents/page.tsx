import { getTranslations } from "next-intl/server";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import {
  DocumentCategoriesContainer,
} from "@/components/modules/settings/modules/documentCategories/components/DocumentCategoriesContainer";

const DocumentCategoriesSettingsPage = async () => {
  const t = await getTranslations("settings.pages.documents");
  return (
  <PageGate
    resource="PEOPLE.DOCUMENT_CATEGORIES"
    action="MANAGE">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title={t("title")} backHref="/settings"/>

        <PageDescription className="text-body text-tertiary/90">
          {t("description")}
        </PageDescription>
      </div>

      <div className="px-8">
        <DocumentCategoriesContainer/>
      </div>
    </div>
  </PageGate>
  );
};

export default DocumentCategoriesSettingsPage;

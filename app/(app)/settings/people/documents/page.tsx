import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import {
  DocumentCategoriesContainer,
} from "@/components/modules/settings/modules/documentCategories/components/DocumentCategoriesContainer";

const DocumentCategoriesSettingsPage: FC = () => (
  <PageGate
    resource="PEOPLE.DOCUMENT_CATEGORIES"
    action="MANAGE">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Document Categories" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          Labels for the documents on a person&apos;s profile. Anyone who can see documents can pick
          a category when uploading; managing the list itself stays here.
        </PageDescription>
      </div>

      <div className="px-8">
        <DocumentCategoriesContainer/>
      </div>
    </div>
  </PageGate>
);

export default DocumentCategoriesSettingsPage;

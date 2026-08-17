import { FC } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import {
  DocumentCategoriesContainer,
} from "@/components/modules/settings/modules/documentCategories/components/DocumentCategoriesContainer";

const DocumentCategoriesSettingsPage: FC = () => (
  <PermissionGate
    resource="PEOPLE.DOCUMENT_CATEGORIES"
    action="MANAGE"
    fallback={<AccessDenied/>}
  >
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
  </PermissionGate>
);

export default DocumentCategoriesSettingsPage;

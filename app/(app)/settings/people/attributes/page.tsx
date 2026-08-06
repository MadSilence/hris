import AttributeGroupsContainer
  from "@/components/modules/settings/modules/attributes/components/AttributeGroupsContainer/AttributeGroupsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { FC } from "react";

const AttributesSettingsPage: FC = () => (
  <PermissionGate resource="PEOPLE.ATTRIBUTES" action="VIEW" fallback={<AccessDenied/>}>
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Person Information" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          Organize the custom fields on a person&apos;s profile. Group attributes into sections,
          define their type and validation, and keep a single consistent model that profiles,
          filters, and reporting rely on.
        </PageDescription>
      </div>

      <div className="px-8">
        <AttributeGroupsContainer/>
      </div>
    </div>
  </PermissionGate>
);

export default AttributesSettingsPage;

import AttributeGroupsContainer
  from "@/components/modules/settings/modules/attributes/components/AttributeGroupsContainer/AttributeGroupsContainer";
import {
  SystemFieldsSection,
} from "@/components/modules/settings/modules/attributes/components/SystemFieldsSection";
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
          Every field a person has. System fields are built in and read-only; below them are the
          custom fields you define — grouped into sections, with their own types and validation.
          One model that profiles, filters, and reporting all rely on.
        </PageDescription>
      </div>

      <div className="space-y-10 px-8">
        <SystemFieldsSection/>

        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Custom fields</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields your company defines. Create sections, choose types and validation, and decide
              what is required or sensitive.
            </p>
          </div>

          <AttributeGroupsContainer/>
        </div>
      </div>
    </div>
  </PermissionGate>
);

export default AttributesSettingsPage;

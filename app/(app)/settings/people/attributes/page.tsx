import {
  PersonFieldsTabs,
} from "@/components/modules/settings/modules/attributes/components/PersonFieldsTabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { FC } from "react";

const AttributesSettingsPage: FC = () => (
  <PageGate resource="PEOPLE.ATTRIBUTES" action="VIEW">
    <div className="space-y-6">
      <div className="px-8 space-y-4">
        <SettingsPageHeader title="Person Information" backHref="/settings"/>

        <PageDescription className="text-base text-muted-foreground/90">
          Every field a person has. <span className="font-medium">Custom fields</span> are the ones
          your company defines — grouped into sections, with their own types, validation and
          sensitivity. <span className="font-medium">System fields</span> are built in and read-only:
          their values come from their own modules, and who may see them is set in Roles → Field
          access.
        </PageDescription>
      </div>

      <div className="px-8">
        <PersonFieldsTabs/>
      </div>
    </div>
  </PageGate>
);

export default AttributesSettingsPage;

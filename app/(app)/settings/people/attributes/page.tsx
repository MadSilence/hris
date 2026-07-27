import AttributeGroupsContainer
  from "@/components/modules/settings/modules/attributes/components/AttributeGroupsContainer/AttributeGroupsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { FC } from "react";

const AttributesSettingsPage: FC = () => (
  <PermissionGate resource="PEOPLE.ATTRIBUTES" action="VIEW" fallback={<AccessDenied/>}>
    <SettingsPageHeader
      title={"Person Information"}
      backHref="/settings"
    />
    <AttributeGroupsContainer/>
  </PermissionGate>
);

export default AttributesSettingsPage;

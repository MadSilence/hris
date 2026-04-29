import AttributeGroupsContainer
  from "@/components/modules/settings/modules/attributes/components/AttributeGroupsContainer/AttributeGroupsContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { FC } from "react";

const AttributesSettingsPage: FC = () => (
  <>
    <SettingsPageHeader
      title={"Person Information"}
      backHref="/settings"
    />
    <AttributeGroupsContainer/>
  </>

);

export default AttributesSettingsPage;

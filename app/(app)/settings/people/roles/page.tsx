import React from "react";
import RolesTableContainer from "@/components/modules/settings/modules/roles/components/RolesTableContainer/RolesTableContainer";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

const RolesSettingsPage: React.FC = () => (
  <>
    <SettingsPageHeader
      title={"Roles and permissions"}
      backHref="/settings"
    />
    <RolesTableContainer />
  </>

);

export default RolesSettingsPage;

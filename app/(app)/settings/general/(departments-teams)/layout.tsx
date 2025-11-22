import { Tabs } from "@/components/layout/Tabs";
import React, { ReactNode } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import styles from "./layout.module.css";

type SettingsLegalEntitiesAndOfficesLayoutProps = {
  children: ReactNode
}

export default function SettingsLegalEntitiesAndOfficesLayout({
  children
}: SettingsLegalEntitiesAndOfficesLayoutProps) {
  const tabs = [
    {
      id: "departments",
      label: "Departments",
      href: "departments",
      description: "Use departments for your primary organizational structure, this is typically your functional structure. You can assign parent departments to represent hierarchy and create sub-departments. For example, Finance > Accounting > Taxes or Human Resources > HR Business Partner > HR Business Partner – Finance.",
    },
    {
      id: "teams",
      label: "Teams",
      href: "teams",
      description: "Use teams for your secondary organizational structure. This typically only applies to companies using a matrix structure. You can assign teams to your cross-functional or horizontal structure also with hierarchy. For example, Projects > Automotive | Energy | Health.",
    },
  ];

  return (
    <div className={styles.shell}>
      <SettingsPageHeader
        title={"Departments & Teams"}
        backHref="/settings"
      />
      <nav className={styles.tabs}>
        <Tabs tabs={tabs}/>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

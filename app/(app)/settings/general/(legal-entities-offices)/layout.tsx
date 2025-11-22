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
    { id: "legal-entities", label: "Legal Entities", href: `legal-entities` },
    { id: "offices", label: "Offices", href: `offices` },
  ];

  return (
    <div className={styles.shell}>
      <SettingsPageHeader
        title={"Legal Entities & Offices"}
        backHref="/settings"
      />
      <nav className={styles.tabs}>
        <Tabs tabs={tabs}/>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

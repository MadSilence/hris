import { Tabs } from "@/components/layout/Tabs";
import React, { ReactNode } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import styles from "./layout.module.css";

type SettingsImportExportLayoutProps = {
  children: ReactNode
}

export default function SettingsImportExportLayout({
  children
}: SettingsImportExportLayoutProps) {
  const tabs = [
    { id: "job-catalog", label: "Job Catalog", href: `job-catalog` },
    { id: "job-levels", label: "Job Levels", href: `job-levels` },
  ];

  return (
    <div className={styles.shell}>
      <SettingsPageHeader
        title={"Job Catalog"}
        backHref="/settings"
      />
      <nav className={styles.tabs}>
        <Tabs tabs={tabs}/>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

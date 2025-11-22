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
    { id: "import", label: "Import", href: `import` },
    { id: "export", label: "Export", href: `export` },
  ];

  return (
    <div className={styles.shell}>
      <SettingsPageHeader
        title={"Import & Export"}
        backHref="/settings"
      />
      <nav className={styles.tabs}>
        <Tabs tabs={tabs}/>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

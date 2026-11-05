import { ReactNode } from "react";
import Link from "next/link";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/components/desact/button";
import { getTranslations } from "next-intl/server";

type SettingsImportExportLayoutProps = {
  children: ReactNode;
};

export default async function SettingsImportExportLayout({
  children,
}: SettingsImportExportLayoutProps) {
  const t = await getTranslations("settings");
  const tabs = [
    { id: "import", label: t("importExport.tabs.import"), href: "import" },
    { id: "export", label: t("importExport.tabs.export"), href: "export" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SettingsPageHeader title={t("menu.items.importExport")} backHref="/settings"/>

      <nav className="pb-5">
        <div className="flex gap-1 border-b border-divider">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              asChild
              variant="ghost"
              className="rounded-none text-secondary hover:bg-subtle hover:text-secondary"
            >
              <Link href={tab.href} className="no-underline">
                {tab.label}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      <main className="flex h-full min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

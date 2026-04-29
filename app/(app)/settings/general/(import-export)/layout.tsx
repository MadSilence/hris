import { ReactNode } from "react";
import Link from "next/link";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/public/desact/src/components/ui/button";

type SettingsImportExportLayoutProps = {
  children: ReactNode;
};

export default function SettingsImportExportLayout({
  children,
}: SettingsImportExportLayoutProps) {
  const tabs = [
    { id: "import", label: "Import", href: "import" },
    { id: "export", label: "Export", href: "export" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SettingsPageHeader title="Import & Export" backHref="/settings"/>

      <nav className="pb-5">
        <div className="flex gap-1 border-b border-brown-200">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              asChild
              variant="ghost"
              className="rounded-none text-brown-600 hover:bg-brown-50 hover:text-brown-700"
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

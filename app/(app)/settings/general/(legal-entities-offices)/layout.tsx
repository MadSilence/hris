import React, { ReactNode } from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PermissionGate } from "@/components/auth/PermissionGate";

type SettingsLegalEntitiesAndOfficesLayoutProps = {
  children: ReactNode
}

export default function SettingsLegalEntitiesAndOfficesLayout({
  children
}: SettingsLegalEntitiesAndOfficesLayoutProps) {
  const tabs = [
    {
      id: "legal-entities",
      label: "Legal Entities",
      href: `legal-entities`,
      description: "Legal Entities define the official registered companies within your organization. Each entity includes important compliance details such as registration number, tax ID, and address.\n" +
        "Use this section to maintain accurate legal information, ensure regulatory compliance, and organize employees under the correct corporate structure."
    },
    {
      id: "offices",
      label: "Offices",
      href: `offices`,
      description: "Offices represent the physical or remote locations where your company operates. Each office contains essential details such as address, country, timezone, and employee distribution.\n" +
        "Use this section to manage your organization’s locations — create new offices, update existing ones, and keep track of how your workforce is distributed across regions."
    },
  ];

  return (
    // <div>
    //   <SettingsPageHeader
    //     title={"Legal Entities & Offices"}
    //     backHref="/settings"
    //   />
    //   <nav>
    //     <Tabs tabs={tabs}/>
    //   </nav>
    //   <main>{children}</main>
    // </div>

    <PermissionGate anyOf={["PERM_ROLES_VIEW"]} fallback={<AccessDenied/>}>
      <div className="min-h-svh px-8 py-8">
        <div className="px-8 pt-8">
          <div className="px-6">
            <SettingsPageHeader
              title={"Legal Entities & Offices"}
              backHref="/settings"
            />
          </div>
        </div>
        <main>{children}</main>
      </div>
    </PermissionGate>
  );
};

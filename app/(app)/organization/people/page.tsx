"use client";

import React from "react";

import PeopleTableContainer from "@/components/modules/organization/components/PeopleTableContainer/PeopleTableContainer";
import { Tabs } from "@/components/layout/Tabs";
import { usePermissions } from "@/components/auth/PermissionsContext";
import { AccessDenied } from "@/components/auth/AccessDenied";
import styles from "./organization.module.css";

const tabs = [
  { id: "people", label: "Organisation Structure", href: `people` },
  { id: "chart", label: "People Chart", href: `chart` },
];

export default function OrganizationPeoplePage() {
  const { canModule, loading } = usePermissions();

  if (loading) return null;
  if (!canModule("PEOPLE", "view")) return <AccessDenied/>;

  return (
    <div className="min-h-svh px-8 py-8">
      <div className="px-8 pt-8">
        <div className="px-6">
          <header className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className={styles.titles}>
                <h1 className={styles.title}>Organisation</h1>
                <p className={styles.subtitle}>
                  Browse employees, search by name/email, and manage custom attributes.
                </p>
              </div>
            </div>
          </header>
        </div>
        <div>
          <Tabs tabs={tabs}/>
        </div>
      </div>
      <div className="mt-6 px-8">
        <PeopleTableContainer/>
      </div>
    </div>
  );
}

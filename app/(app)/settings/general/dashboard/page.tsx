"use client";

import * as React from "react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

export default function DocumentsPage() {
  return (
    <>
      <SettingsPageHeader
        title={"Dashboard"}
        backHref="/settings"
      />
      <p>Dashboard</p>
    </>
  );
}

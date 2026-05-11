"use client";

import React from "react";
import {
  CompanyAppearanceSettingsComponent
} from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsComponent";

export type CompanyAppearanceSettings = {
  primaryColor: string;
  accentColors: string[];
  sidebarStyle: "light" | "dark";
  loginBackgroundImageUrl?: string;
};

const mockCompanyAppearance: CompanyAppearanceSettings = {
  primaryColor: "#7C3AED",
  accentColors: ["#F97316", "#06B6D4", "#22C55E", "#F43F5E"],
  sidebarStyle: "dark",
  loginBackgroundImageUrl: "",
};

export default function CompanyAppearanceSettingsContainer() {
  return <CompanyAppearanceSettingsComponent appearance={mockCompanyAppearance}/>;
}

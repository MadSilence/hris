"use client";

import { AppearanceLoading } from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsContainer";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useAppFrame } from "@/components/layout/AppFrame";

/**
 * Appearance's own loading (L6-Loading, the designers' AP4): a click on Appearance shows the page's shape at once — the
 * back button, the heading and the lead, the steps' skeletons and the stage — not the shell's generic rows.
 */
export default function AppearanceRouteLoading() {
  const { company } = useCompanyData();
  useAppFrame("full");
  return <AppearanceLoading companyName={company?.name ?? ""} />;
}

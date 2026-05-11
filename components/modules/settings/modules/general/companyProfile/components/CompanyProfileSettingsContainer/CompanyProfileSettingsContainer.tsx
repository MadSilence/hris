"use client";

import React from "react";
import {
  CompanyProfileSettingsComponent
} from "@/components/modules/settings/modules/general/companyProfile/components/CompanyProfileSettingsComponent";

export type CompanyProfileSettings = {
  fullName: string;
  shortName: string;
  domain: string;
  logoUrl?: string;
  avatarInitials: string;
  brandTagline: string;
  description: string;
  websiteUrl: string;
  supportUrl: string;
};

const mockCompanyProfile: CompanyProfileSettings = {
  fullName: "Biosample Technologies Sp. z o.o.",
  shortName: "Biosample",
  domain: "biosample.com",
  logoUrl: "",
  avatarInitials: "BT",
  brandTagline: "People operations, beautifully organized.",
  description:
    "A modern HR platform helping companies manage people, documents, time off, and internal workflows.",
  websiteUrl: "https://biosample.com",
  supportUrl: "https://support.biosample.com",
};

export default function CompanyProfileSettingsContainer() {
  return <CompanyProfileSettingsComponent company={mockCompanyProfile}/>;
}
